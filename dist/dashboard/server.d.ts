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
export declare class DashboardServer {
    private app;
    private config;
    private startTime;
    constructor(config: DashboardConfig);
    private setupMiddleware;
    private setupRoutes;
    start(): void;
}
