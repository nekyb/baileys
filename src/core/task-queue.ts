
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

export class TaskQueue {
  private queue: Task[] = [];
  private processing: boolean = false;
  private workers: number;
  private activeWorkers: number = 0;
  private completedTasks: number = 0;
  private failedTasks: number = 0;
  private executionTimes: number[] = [];

  constructor(workers: number = 3) {
    this.workers = workers;
  }

  async add<T>(
    fn: () => Promise<T>,
    options: {
      priority?: number;
      maxRetries?: number;
      delay?: number;
    } = {}
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const task: Task<T> = {
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
          } catch (error) {
            if (task.retries < task.maxRetries) {
              task.retries++;
              const backoffDelay = task.delay * Math.pow(2, task.retries);
              await new Promise(r => setTimeout(r, backoffDelay));
              this.queue.unshift(task);
              this.process();
            } else {
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

  private async process(): Promise<void> {
    if (this.activeWorkers >= this.workers || this.queue.length === 0) {
      return;
    }

    this.activeWorkers++;
    const task = this.queue.shift();

    if (task) {
      try {
        await task.fn();
      } catch (error) {
        // Error ya manejado en el task.fn
      } finally {
        this.activeWorkers--;
        this.process();
      }
    }
  }

  getStats(): TaskQueueStats {
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

  clear(): void {
    this.queue = [];
  }

  setWorkers(count: number): void {
    this.workers = count;
  }
}

export class Throttler {
  private lastExecution: Map<string, number> = new Map();
  private minInterval: number;

  constructor(minIntervalMs: number = 1000) {
    this.minInterval = minIntervalMs;
  }

  async throttle<T>(key: string, fn: () => Promise<T>): Promise<T> {
    const now = Date.now();
    const lastTime = this.lastExecution.get(key) || 0;
    const timeSinceLastExecution = now - lastTime;

    if (timeSinceLastExecution < this.minInterval) {
      await new Promise(resolve => 
        setTimeout(resolve, this.minInterval - timeSinceLastExecution)
      );
    }

    this.lastExecution.set(key, Date.now());
    return await fn();
  }

  reset(key?: string): void {
    if (key) {
      this.lastExecution.delete(key);
    } else {
      this.lastExecution.clear();
    }
  }
}
