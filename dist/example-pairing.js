"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
const logger_1 = require("./utils/logger");
const readline = __importStar(require("readline"));
async function main() {
    logger_1.logger.printBanner();
    logger_1.logger.separator();
    logger_1.logger.info('🔗 Soblend Baileys - Vinculación con Código de Emparejamiento');
    logger_1.logger.separator();
    const soblend = new index_1.SoblendBaileys({
        printQRInTerminal: false,
        enableCache: true,
        enableAntiSpam: true,
        enableRateLimit: true,
        logLevel: 'info',
    });
    try {
        logger_1.logger.loading('Iniciando conexión...');
        const socket = await soblend.connect('auth_info');
        logger_1.logger.clearLoading();
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        const askPhoneNumber = () => {
            return new Promise((resolve) => {
                rl.question('\n📱 Ingresa tu número de WhatsApp (formato internacional sin +, ej: 5491234567890): ', (answer) => {
                    resolve(answer.trim());
                });
            });
        };
        const phoneNumber = await askPhoneNumber();
        rl.close();
        logger_1.logger.info(`Generando código de emparejamiento para ${phoneNumber}...`);
        logger_1.logger.separator();
        const code = await soblend.requestPairingCode({
            phoneNumber: phoneNumber,
            printCode: true,
            onCodeGenerated: (generatedCode) => {
                logger_1.logger.success(`✅ Código generado exitosamente: ${generatedCode}`);
            }
        });
        logger_1.logger.separator();
        logger_1.logger.info('⏳ Esperando vinculación...');
        logger_1.logger.info('El código expira en unos minutos. Si no funciona, reinicia el proceso.');
        socket.ev.on('connection.update', (update) => {
            const { connection } = update;
            if (connection === 'open') {
                logger_1.logger.separator();
                logger_1.logger.success('🎉 ¡Vinculación exitosa!');
                logger_1.logger.success('Bot conectado y listo para usar');
                logger_1.logger.separator();
            }
        });
        socket.ev.on('messages.upsert', async ({ messages }) => {
            for (const msg of messages) {
                if (!msg.message || msg.key.fromMe)
                    continue;
                const sender = msg.key.remoteJid;
                const text = msg.message.conversation ||
                    msg.message.extendedTextMessage?.text || '';
                if (text.toLowerCase() === 'ping') {
                    await socket.sendMessage(sender, {
                        text: '🏓 Pong! Bot vinculado con código de emparejamiento funcionando correctamente.'
                    });
                }
                if (text.toLowerCase() === 'info') {
                    await socket.sendMessage(sender, {
                        text: '📱 *Bot Vinculado con Código de Emparejamiento*\n\n' +
                            '✅ Conectado exitosamente usando código de 8 dígitos\n' +
                            '🔗 Sistema de vinculación: Activo\n' +
                            '⚡ Powered by @soblend/baileys\n\n' +
                            'Comandos:\n' +
                            '• ping - Verificar conexión\n' +
                            '• info - Mostrar esta información'
                    });
                }
            }
        });
    }
    catch (error) {
        logger_1.logger.error(`Error durante la vinculación: ${error.message}`);
        process.exit(1);
    }
}
main().catch((error) => {
    logger_1.logger.error(`Error crítico: ${error}`);
    console.error(error);
});
