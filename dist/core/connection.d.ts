import { SmartCache } from '../utils/cache';
import { MediaCompressor } from '../utils/compression';
import { PluginManager } from '../plugins/plugin-manager';
import { TaskQueue, Throttler } from './task-queue';
import { SoblendConfig, SoblendSocket } from '../types';
export declare class SoblendBaileys {
    private config;
    private socket;
    private cache;
    private compressor;
    private antiSpam;
    private rateLimiter;
    private pluginManager;
    private taskQueue;
    private throttler;
    private reconnectAttempts;
    private startTime;
    private messageCount;
    constructor(config?: Partial<SoblendConfig>);
    connect(authPath?: string): Promise<SoblendSocket>;
    private getEnhancedSocket;
    getPluginManager(): PluginManager;
    getCache(): SmartCache;
    getCompressor(): MediaCompressor;
    getTaskQueue(): TaskQueue;
    getThrottler(): Throttler;
}
