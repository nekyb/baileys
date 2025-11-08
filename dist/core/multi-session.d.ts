import { SoblendSocket, SoblendConfig } from '../types';
export interface SessionInfo {
    id: string;
    name: string;
    socket: SoblendSocket | null;
    status: 'disconnected' | 'connecting' | 'connected' | 'error';
    authPath: string;
    config: Partial<SoblendConfig>;
    connectedAt?: number;
    lastError?: string;
}
export declare class MultiSessionManager {
    private sessions;
    private instances;
    constructor();
    createSession(id: string, name: string, config?: Partial<SoblendConfig>): void;
    connectSession(id: string): Promise<SoblendSocket>;
    disconnectSession(id: string): Promise<void>;
    deleteSession(id: string): void;
    getSession(id: string): SessionInfo | undefined;
    getAllSessions(): SessionInfo[];
    getConnectedSessions(): SessionInfo[];
    connectAll(): Promise<void>;
    disconnectAll(): Promise<void>;
    getStats(): {
        total: number;
        connected: number;
        disconnected: number;
        connecting: number;
        error: number;
    };
}
