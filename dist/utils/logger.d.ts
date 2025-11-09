export declare class SoblendLogger {
    private static instance;
    private startTime;
    private animationFrame;
    private logLevel;
    private constructor();
    static getInstance(): SoblendLogger;
    setLogLevel(level: 'trace' | 'debug' | 'info' | 'warn' | 'error'): void;
    private shouldLog;
    private formatTimestamp;
    printBanner(): void;
    printFeatures(): void;
    trace(message: string): void;
    debug(message: string): void;
    info(message: string): void;
    success(message: string): void;
    warning(message: string): void;
    error(message: string, error?: Error): void;
    connection(status: 'connected' | 'disconnected' | 'connecting' | 'error', details?: string): void;
    session(sessionId: string, action: string, status: 'success' | 'error' | 'info'): void;
    message(from: string, text: string, type?: 'incoming' | 'outgoing'): void;
    stats(stats: any): void;
    table(title: string, data: Array<{
        label: string;
        value: any;
    }>): void;
    private formatUptime;
    separator(): void;
    footer(): void;
    loading(message: string): void;
    clearLoading(): void;
}
export declare const logger: SoblendLogger;
