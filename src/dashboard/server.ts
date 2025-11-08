
import express, { Express, Request, Response } from 'express';
import { SoblendStorage } from '../database/storage';
import { TaskQueue } from '../core/task-queue';
import { SmartCache } from '../utils/cache';
import { AntiSpam } from '../admin/anti-spam';
import { RateLimiter } from '../admin/rate-limiter';

export interface DashboardConfig {
  port: number;
  host: string;
  secret: string;
  storage: SoblendStorage;
  taskQueue?: TaskQueue;
  cache?: SmartCache;
  antiSpam?: AntiSpam;
  rateLimiter?: RateLimiter;
}

export class DashboardServer {
  private app: Express;
  private config: DashboardConfig;
  private startTime: number = Date.now();

  constructor(config: DashboardConfig) {
    this.config = config;
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    this.app.use(express.json());
    this.app.use(express.static('public'));
    
    // Auth middleware
    this.app.use((req: Request, res: Response, next) => {
      const authHeader = req.headers.authorization;
      if (req.path === '/health') return next();
      
      if (!authHeader || authHeader !== `Bearer ${this.config.secret}`) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      next();
    });
  }

  private setupRoutes(): void {
    // Health check
    this.app.get('/health', (req: Request, res: Response) => {
      res.json({ status: 'ok', uptime: Date.now() - this.startTime });
    });

    // Dashboard stats
    this.app.get('/api/stats', async (req: Request, res: Response) => {
      try {
        const users = await this.config.storage.getAllUsers();
        const groups = await this.config.storage.getAllGroups();
        const chats = await this.config.storage.getAllChats();

        const stats = {
          users: {
            total: Object.keys(users).length,
            banned: Object.values(users).filter(u => u.isBanned).length,
            blocked: Object.values(users).filter(u => u.isBlocked).length,
          },
          groups: {
            total: Object.keys(groups).length,
          },
          chats: {
            total: Object.keys(chats).length,
            pinned: Object.values(chats).filter(c => c.isPinned).length,
          },
          system: {
            uptime: Date.now() - this.startTime,
            cache: this.config.cache?.getStats(),
            taskQueue: this.config.taskQueue?.getStats(),
          },
        };

        res.json(stats);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });

    // Users management
    this.app.get('/api/users', async (req: Request, res: Response) => {
      try {
        const users = await this.config.storage.getAllUsers();
        res.json(Object.values(users));
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });

    this.app.get('/api/users/top', async (req: Request, res: Response) => {
      try {
        const limit = parseInt(req.query.limit as string) || 10;
        const topUsers = await this.config.storage.getTopUsers(limit);
        res.json(topUsers);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });

    this.app.post('/api/users/:jid/ban', async (req: Request, res: Response) => {
      try {
        await this.config.storage.banUser(req.params.jid);
        res.json({ success: true });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });

    this.app.post('/api/users/:jid/unban', async (req: Request, res: Response) => {
      try {
        await this.config.storage.unbanUser(req.params.jid);
        res.json({ success: true });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });

    // Groups management
    this.app.get('/api/groups', async (req: Request, res: Response) => {
      try {
        const groups = await this.config.storage.getAllGroups();
        res.json(Object.values(groups));
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });

    // Config management
    this.app.get('/api/config', (req: Request, res: Response) => {
      try {
        const config = this.config.storage.getConfig();
        res.json(config);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });

    this.app.patch('/api/config', async (req: Request, res: Response) => {
      try {
        await this.config.storage.updateConfig(req.body);
        res.json({ success: true });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });

    // Logs (simulated)
    this.app.get('/api/logs', (req: Request, res: Response) => {
      const limit = parseInt(req.query.limit as string) || 100;
      res.json({
        logs: [],
        message: 'Log system not implemented yet',
      });
    });
  }

  start(): void {
    this.app.listen(this.config.port, this.config.host, () => {
      console.log(`📊 Dashboard running on http://${this.config.host}:${this.config.port}`);
    });
  }
}
