"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardServer = void 0;
const express_1 = __importDefault(require("express"));
class DashboardServer {
    app;
    config;
    startTime = Date.now();
    constructor(config) {
        this.config = config;
        this.app = (0, express_1.default)();
        this.setupMiddleware();
        this.setupRoutes();
    }
    setupMiddleware() {
        this.app.use(express_1.default.json());
        this.app.use(express_1.default.static('public'));
        this.app.use((req, res, next) => {
            const authHeader = req.headers.authorization;
            if (req.path === '/health')
                return next();
            if (!authHeader || authHeader !== `Bearer ${this.config.secret}`) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            next();
        });
    }
    setupRoutes() {
        this.app.get('/health', (req, res) => {
            res.json({ status: 'ok', uptime: Date.now() - this.startTime });
        });
        this.app.get('/api/stats', async (req, res) => {
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
            }
            catch (error) {
                res.status(500).json({ error: error.message });
            }
        });
        this.app.get('/api/users', async (req, res) => {
            try {
                const users = await this.config.storage.getAllUsers();
                res.json(Object.values(users));
            }
            catch (error) {
                res.status(500).json({ error: error.message });
            }
        });
        this.app.get('/api/users/top', async (req, res) => {
            try {
                const limit = parseInt(req.query.limit) || 10;
                const topUsers = await this.config.storage.getTopUsers(limit);
                res.json(topUsers);
            }
            catch (error) {
                res.status(500).json({ error: error.message });
            }
        });
        this.app.post('/api/users/:jid/ban', async (req, res) => {
            try {
                await this.config.storage.banUser(req.params.jid);
                res.json({ success: true });
            }
            catch (error) {
                res.status(500).json({ error: error.message });
            }
        });
        this.app.post('/api/users/:jid/unban', async (req, res) => {
            try {
                await this.config.storage.unbanUser(req.params.jid);
                res.json({ success: true });
            }
            catch (error) {
                res.status(500).json({ error: error.message });
            }
        });
        this.app.get('/api/groups', async (req, res) => {
            try {
                const groups = await this.config.storage.getAllGroups();
                res.json(Object.values(groups));
            }
            catch (error) {
                res.status(500).json({ error: error.message });
            }
        });
        this.app.get('/api/config', (req, res) => {
            try {
                const config = this.config.storage.getConfig();
                res.json(config);
            }
            catch (error) {
                res.status(500).json({ error: error.message });
            }
        });
        this.app.patch('/api/config', async (req, res) => {
            try {
                await this.config.storage.updateConfig(req.body);
                res.json({ success: true });
            }
            catch (error) {
                res.status(500).json({ error: error.message });
            }
        });
        this.app.get('/api/logs', (req, res) => {
            const limit = parseInt(req.query.limit) || 100;
            res.json({
                logs: [],
                message: 'Log system not implemented yet',
            });
        });
    }
    start() {
        this.app.listen(this.config.port, this.config.host, () => {
            console.log(`📊 Dashboard running on http://${this.config.host}:${this.config.port}`);
        });
    }
}
exports.DashboardServer = DashboardServer;
