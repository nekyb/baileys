
import { WASocket } from '@whiskeysockets/baileys';
import { logger } from '../utils/logger';

interface AutoReplyRule {
  trigger: string | RegExp;
  response: string | (() => string);
  enabled: boolean;
  cooldown?: number;
}

export class AutoReplySystem {
  private rules: Map<string, AutoReplyRule> = new Map();
  private lastTrigger: Map<string, number> = new Map();

  constructor(private socket: WASocket) {
    this.setupDefaultRules();
  }

  private setupDefaultRules(): void {
    this.addRule('greeting', {
      trigger: /hola|hello|hi|buenos días/i,
      response: () => {
        const hour = new Date().getHours();
        if (hour < 12) return '¡Buenos días! ☀️ ¿En qué puedo ayudarte?';
        if (hour < 18) return '¡Buenas tardes! 🌤️ ¿En qué puedo ayudarte?';
        return '¡Buenas noches! 🌙 ¿En qué puedo ayudarte?';
      },
      enabled: true,
      cooldown: 60000,
    });

    this.addRule('help', {
      trigger: /ayuda|help|comandos/i,
      response: `🤖 *Comandos Disponibles*\n\n` +
                `• /help - Muestra este mensaje\n` +
                `• /stats - Estadísticas del bot\n` +
                `• /ping - Verifica latencia\n` +
                `• /info - Información del bot`,
      enabled: true,
      cooldown: 30000,
    });
  }

  addRule(id: string, rule: AutoReplyRule): void {
    this.rules.set(id, rule);
    logger.plugin('AutoReply', `Regla "${id}" agregada`);
  }

  async processMessage(from: string, text: string): Promise<boolean> {
    for (const [id, rule] of this.rules.entries()) {
      if (!rule.enabled) continue;

      const matches = typeof rule.trigger === 'string' 
        ? text.toLowerCase().includes(rule.trigger.toLowerCase())
        : rule.trigger.test(text);

      if (matches) {
        const key = `${from}:${id}`;
        const lastTime = this.lastTrigger.get(key) || 0;
        const now = Date.now();

        if (rule.cooldown && now - lastTime < rule.cooldown) {
          continue;
        }

        const response = typeof rule.response === 'function' 
          ? rule.response() 
          : rule.response;

        await this.socket.sendMessage(from, { text: response });
        this.lastTrigger.set(key, now);
        logger.info(`Auto-respuesta enviada a ${from} (regla: ${id})`);
        return true;
      }
    }
    return false;
  }
}
