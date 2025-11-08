import { SoblendSocket } from '../types';
export interface UpdateInfo {
    currentVersion: string;
    latestVersion: string;
    hasUpdate: boolean;
    releaseNotes: string;
    publishedAt: string;
    downloadUrl: string;
}
export declare class AutoUpdater {
    private packageName;
    private currentVersion;
    private checkInterval;
    private lastCheckTime;
    constructor(currentVersion?: string);
    private getPackageVersion;
    checkForUpdates(): Promise<UpdateInfo>;
    private compareVersions;
    sendUpdateNotification(socket: SoblendSocket, jid: string, updateInfo: UpdateInfo): Promise<void>;
    startAutoCheck(socket: SoblendSocket, ownerJid: string, intervalHours?: number): void;
    stopAutoCheck(): void;
    performUpdate(): Promise<{
        success: boolean;
        message: string;
    }>;
}
