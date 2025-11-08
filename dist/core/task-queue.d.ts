export interface Task<T = any> {
    id: string;
    fn: () => Promise<T>;
    priority: number;
    retries: number;
    maxRetries: number;
    delay: number;
    createdAt: number;
}
export interface TaskQueueStats {
    queueSize: number;
    activeWorkers: number;
    maxWorkers: number;
    completedTasks: number;
    failedTasks: number;
    averageExecutionTime: number;
}
export declare class TaskQueue {
    private queue;
    private processing;
    private workers;
    private activeWorkers;
    private completedTasks;
    private failedTasks;
    private executionTimes;
    constructor(workers?: number);
    add<T>(fn: () => Promise<T>, options?: {
        priority?: number;
        maxRetries?: number;
        delay?: number;
    }): Promise<T>;
    private process;
    getStats(): TaskQueueStats;
    clear(): void;
    setWorkers(count: number): void;
}
export declare class Throttler {
    private lastExecution;
    private minInterval;
    constructor(minIntervalMs?: number);
    throttle<T>(key: string, fn: () => Promise<T>): Promise<T>;
    reset(key?: string): void;
}
