import { WASocket } from '@whiskeysockets/baileys';
export interface PairingCodeOptions {
    phoneNumber: string;
    printCode?: boolean;
    onCodeGenerated?: (code: string) => void;
}
export declare class PairingCodeManager {
    private socket;
    private currentCode;
    setSocket(socket: WASocket): void;
    requestPairingCode(options: PairingCodeOptions): Promise<string>;
    private formatPhoneNumber;
    private isValidPhoneNumber;
    private formatCode;
    private printCode;
    getCurrentCode(): string | null;
    clearCode(): void;
}
