export declare class SoblendLogger {
    private static instance;
    private startTime;
    private animationFrame;
    private constructor();
    static getInstance(): SoblendLogger;
    printBanner(): void;
    printFeatures(): void;
    success(message: string): void;
    error(message: string): void;
    warning(message: string): void;
    info(message: string): void;
    debug(message: string): void;
    plugin(name: string, message: string): void;
    connection(status: string, details?: string): void;
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
