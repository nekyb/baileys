"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultiSessionManager = void 0;
const connection_1 = require("./connection");
class MultiSessionManager {
    sessions;
    instances;
    constructor() {
        this.sessions = new Map();
        this.instances = new Map();
    }
    createSession(id, name, config = {}) {
        if (this.sessions.has(id)) {
            throw new Error(`Session ${id} already exists`);
        }
        const sessionInfo = {
            id,
            name,
            socket: null,
            status: 'disconnected',
            authPath: `./auth_${id}`,
            config,
        };
        this.sessions.set(id, sessionInfo);
    }
    async connectSession(id) {
        const sessionInfo = this.sessions.get(id);
        if (!sessionInfo) {
            throw new Error(`Session ${id} not found`);
        }
        if (sessionInfo.status === 'connected' && sessionInfo.socket) {
            return sessionInfo.socket;
        }
        try {
            sessionInfo.status = 'connecting';
            const instance = new connection_1.SoblendBaileys(sessionInfo.config);
            this.instances.set(id, instance);
            const socket = await instance.connect(sessionInfo.authPath);
            sessionInfo.socket = socket;
            sessionInfo.status = 'connected';
            sessionInfo.connectedAt = Date.now();
            console.log(`✅ Session ${id} (${sessionInfo.name}) connected`);
            return socket;
        }
        catch (error) {
            sessionInfo.status = 'error';
            sessionInfo.lastError = error.message;
            throw error;
        }
    }
    async disconnectSession(id) {
        const sessionInfo = this.sessions.get(id);
        if (!sessionInfo) {
            throw new Error(`Session ${id} not found`);
        }
        if (sessionInfo.socket) {
            sessionInfo.socket.end(undefined);
            sessionInfo.socket = null;
        }
        sessionInfo.status = 'disconnected';
        this.instances.delete(id);
        console.log(`🔌 Session ${id} (${sessionInfo.name}) disconnected`);
    }
    deleteSession(id) {
        if (this.sessions.has(id)) {
            this.disconnectSession(id);
            this.sessions.delete(id);
            console.log(`🗑️ Session ${id} deleted`);
        }
    }
    getSession(id) {
        return this.sessions.get(id);
    }
    getAllSessions() {
        return Array.from(this.sessions.values());
    }
    getConnectedSessions() {
        return this.getAllSessions().filter(s => s.status === 'connected');
    }
    async connectAll() {
        const promises = Array.from(this.sessions.keys()).map(id => this.connectSession(id).catch(error => {
            console.error(`Failed to connect session ${id}:`, error.message);
        }));
        await Promise.all(promises);
    }
    async disconnectAll() {
        const promises = Array.from(this.sessions.keys()).map(id => this.disconnectSession(id).catch(error => {
            console.error(`Failed to disconnect session ${id}:`, error.message);
        }));
        await Promise.all(promises);
    }
    getStats() {
        return {
            total: this.sessions.size,
            connected: this.getConnectedSessions().length,
            disconnected: this.getAllSessions().filter(s => s.status === 'disconnected').length,
            connecting: this.getAllSessions().filter(s => s.status === 'connecting').length,
            error: this.getAllSessions().filter(s => s.status === 'error').length,
        };
    }
}
exports.MultiSessionManager = MultiSessionManager;
