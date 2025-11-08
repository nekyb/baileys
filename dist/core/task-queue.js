"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Throttler = exports.TaskQueue = void 0;
class TaskQueue {
    queue = [];
    processing = false;
    workers;
    activeWorkers = 0;
    completedTasks = 0;
    failedTasks = 0;
    executionTimes = [];
    constructor(workers = 3) {
        this.workers = workers;
    }
    async add(fn, options = {}) {
        return new Promise((resolve, reject) => {
            const task = {
                id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                fn: async () => {
                    const startTime = Date.now();
                    try {
                        const result = await fn();
                        const executionTime = Date.now() - startTime;
                        this.executionTimes.push(executionTime);
                        if (this.executionTimes.length > 100) {
                            this.executionTimes.shift();
                        }
                        this.completedTasks++;
                        resolve(result);
                        return result;
                    }
                    catch (error) {
                        if (task.retries < task.maxRetries) {
                            task.retries++;
                            const backoffDelay = task.delay * Math.pow(2, task.retries);
                            await new Promise(r => setTimeout(r, backoffDelay));
                            this.queue.unshift(task);
                            this.process();
                        }
                        else {
                            this.failedTasks++;
                            reject(error);
                        }
                        throw error;
                    }
                },
                priority: options.priority || 0,
                retries: 0,
                maxRetries: options.maxRetries || 3,
                delay: options.delay || 1000,
                createdAt: Date.now(),
            };
            this.queue.push(task);
            this.queue.sort((a, b) => b.priority - a.priority);
            this.process();
        });
    }
    async process() {
        if (this.activeWorkers >= this.workers || this.queue.length === 0) {
            return;
        }
        this.activeWorkers++;
        const task = this.queue.shift();
        if (task) {
            try {
                await task.fn();
            }
            catch (error) {
            }
            finally {
                this.activeWorkers--;
                this.process();
            }
        }
    }
    getStats() {
        const avgTime = this.executionTimes.length > 0
            ? this.executionTimes.reduce((a, b) => a + b, 0) / this.executionTimes.length
            : 0;
        return {
            queueSize: this.queue.length,
            activeWorkers: this.activeWorkers,
            maxWorkers: this.workers,
            completedTasks: this.completedTasks,
            failedTasks: this.failedTasks,
            averageExecutionTime: avgTime,
        };
    }
    clear() {
        this.queue = [];
    }
    setWorkers(count) {
        this.workers = count;
    }
}
exports.TaskQueue = TaskQueue;
class Throttler {
    lastExecution = new Map();
    minInterval;
    constructor(minIntervalMs = 1000) {
        this.minInterval = minIntervalMs;
    }
    async throttle(key, fn) {
        const now = Date.now();
        const lastTime = this.lastExecution.get(key) || 0;
        const timeSinceLastExecution = now - lastTime;
        if (timeSinceLastExecution < this.minInterval) {
            await new Promise(resolve => setTimeout(resolve, this.minInterval - timeSinceLastExecution));
        }
        this.lastExecution.set(key, Date.now());
        return await fn();
    }
    reset(key) {
        if (key) {
            this.lastExecution.delete(key);
        }
        else {
            this.lastExecution.clear();
        }
    }
}
exports.Throttler = Throttler;
