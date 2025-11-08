import { SoblendSocket } from '../types';
export interface StatusMessage {
    id: string;
    from: string;
    timestamp: number;
    type: 'text' | 'image' | 'video';
    content?: string;
    mediaUrl?: string;
    mediaBuffer?: Buffer;
    caption?: string;
}
export declare class StatusCapture {
    private socket;
    private capturedStatuses;
    private onStatusCallback?;
    constructor(socket: SoblendSocket);
    private setupStatusListener;
    private handleStatus;
    onStatus(callback: (status: StatusMessage) => void): void;
    getStatusesFrom(jid: string): StatusMessage[];
    getAllStatuses(): Map<string, StatusMessage[]>;
    clearStatuses(jid?: string): void;
    getStats(): {
        totalUsers: number;
        totalStatuses: number;
        byType: {
            text: number;
            image: number;
            video: number;
        };
    };
    private getTypeStats;
}
