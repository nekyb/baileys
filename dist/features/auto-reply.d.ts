import { WASocket } from '@whiskeysockets/baileys';
interface AutoReplyRule {
    trigger: string | RegExp;
    response: string | (() => string);
    enabled: boolean;
    cooldown?: number;
}
export declare class AutoReplySystem {
    private socket;
    private rules;
    private lastTrigger;
    constructor(socket: WASocket);
    private setupDefaultRules;
    addRule(id: string, rule: AutoReplyRule): void;
    processMessage(from: string, text: string): Promise<boolean>;
}
export {};
