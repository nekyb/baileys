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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SoblendBaileys = void 0;
const baileys_1 = __importStar(require("@whiskeysockets/baileys"));
const pino_1 = __importDefault(require("pino"));
const cache_1 = require("../utils/cache");
const compression_1 = require("../utils/compression");
const anti_spam_1 = require("../admin/anti-spam");
const rate_limiter_1 = require("../admin/rate-limiter");
const plugin_manager_1 = require("../plugins/plugin-manager");
const task_queue_1 = require("./task-queue");
class SoblendBaileys {
    config;
    socket = null;
    cache;
    compressor;
    antiSpam;
    rateLimiter;
    pluginManager;
    taskQueue;
    throttler;
    reconnectAttempts = 0;
    startTime = Date.now();
    messageCount = 0;
    constructor(config = {}) {
        this.config = {
            printQRInTerminal: config.printQRInTerminal ?? true,
            autoReconnect: config.autoReconnect ?? true,
            maxReconnectAttempts: config.maxReconnectAttempts ?? 10,
            reconnectDelay: config.reconnectDelay ?? 3000,
            enableCache: config.enableCache ?? true,
            cacheExpiry: config.cacheExpiry ?? 300000,
            enableAntiSpam: config.enableAntiSpam ?? true,
            spamThreshold: config.spamThreshold ?? 5,
            spamTimeWindow: config.spamTimeWindow ?? 10000,
            enableRateLimit: config.enableRateLimit ?? true,
            rateLimitMax: config.rateLimitMax ?? 30,
            rateLimitWindow: config.rateLimitWindow ?? 60000,
            enableCompression: config.enableCompression ?? true,
            compressionQuality: config.compressionQuality ?? 80,
            enablePlugins: config.enablePlugins ?? true,
            logLevel: config.logLevel ?? 'info',
        };
        this.cache = new cache_1.SmartCache(this.config.cacheExpiry);
        this.compressor = new compression_1.MediaCompressor(this.config.compressionQuality);
        this.antiSpam = new anti_spam_1.AntiSpam(this.config.spamThreshold, this.config.spamTimeWindow);
        this.rateLimiter = new rate_limiter_1.RateLimiter(this.config.rateLimitMax, this.config.rateLimitWindow);
        this.pluginManager = new plugin_manager_1.PluginManager();
        this.taskQueue = new task_queue_1.TaskQueue(3);
        this.throttler = new task_queue_1.Throttler(1000);
    }
    async connect(authPath = 'auth_info') {
        const { state, saveCreds } = await (0, baileys_1.useMultiFileAuthState)(authPath);
        const { version } = await (0, baileys_1.fetchLatestBaileysVersion)();
        const logger = (0, pino_1.default)({ level: this.config.logLevel });
        this.socket = (0, baileys_1.default)({
            version,
            auth: {
                creds: state.creds,
                keys: (0, baileys_1.makeCacheableSignalKeyStore)(state.keys, logger),
            },
            printQRInTerminal: this.config.printQRInTerminal,
            logger,
            browser: baileys_1.Browsers.ubuntu('Soblend Baileys'),
            getMessage: async (key) => {
                if (this.config.enableCache) {
                    const cached = this.cache.get(`msg:${key.id}`);
                    if (cached)
                        return cached;
                }
                return { conversation: '' };
            },
        });
        this.socket.ev.on('creds.update', saveCreds);
        this.socket.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect } = update;
            if (connection === 'close') {
                const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== baileys_1.DisconnectReason.loggedOut;
                if (shouldReconnect && this.config.autoReconnect) {
                    if (this.reconnectAttempts < this.config.maxReconnectAttempts) {
                        this.reconnectAttempts++;
                        console.log(`Reconnecting... Attempt ${this.reconnectAttempts}/${this.config.maxReconnectAttempts}`);
                        setTimeout(() => this.connect(authPath), this.config.reconnectDelay);
                    }
                    else {
                        console.error('Max reconnection attempts reached');
                    }
                }
            }
            else if (connection === 'open') {
                console.log('✅ Connected successfully to WhatsApp!');
                this.reconnectAttempts = 0;
                if (this.config.enablePlugins) {
                    await this.pluginManager.initializeAll(this.getEnhancedSocket());
                }
            }
        });
        this.socket.ev.on('messages.upsert', async ({ messages, type }) => {
            for (const msg of messages) {
                if (!msg.message || msg.key.fromMe)
                    continue;
                this.messageCount++;
                const sender = msg.key.remoteJid || '';
                if (this.config.enableAntiSpam && this.antiSpam.checkSpam(sender)) {
                    console.log(`🚫 Spam detected from ${sender}`);
                    continue;
                }
                if (this.config.enableRateLimit && !this.rateLimiter.checkLimit(sender)) {
                    console.log(`⏱️ Rate limit exceeded for ${sender}`);
                    continue;
                }
                if (this.config.enableCache) {
                    this.cache.set(`msg:${msg.key.id}`, msg.message);
                }
                if (this.config.enablePlugins) {
                    await this.pluginManager.onMessage(msg);
                    const text = msg.message.conversation ||
                        msg.message.extendedTextMessage?.text || '';
                    if (text.startsWith('!')) {
                        const [command, ...args] = text.slice(1).split(' ');
                        await this.pluginManager.onCommand(command, args, msg);
                    }
                }
            }
        });
        return this.getEnhancedSocket();
    }
    getEnhancedSocket() {
        if (!this.socket) {
            throw new Error('Socket not initialized. Call connect() first.');
        }
        const enhancedSocket = this.socket;
        enhancedSocket.sendInteractiveButtons = async (jid, data) => {
            if (!data.buttons || data.buttons.length === 0) {
                throw new Error('Buttons are required for interactive button messages');
            }
            const buttonMessage = {
                text: data.text || '',
                footer: data.footer || '',
                buttons: data.buttons.map((btn) => ({
                    buttonId: btn.buttonId,
                    buttonText: { displayText: btn.buttonText.displayText },
                    type: 1,
                })),
                headerType: data.headerType || 1,
            };
            if (data.image) {
                const imageBuffer = typeof data.image === 'string'
                    ? await this.compressor.compressImage(data.image)
                    : data.image;
                buttonMessage.image = imageBuffer;
                buttonMessage.headerType = 4;
            }
            if (data.video) {
                buttonMessage.video = data.video;
                buttonMessage.headerType = 5;
            }
            const message = (0, baileys_1.generateWAMessageFromContent)(jid, {
                viewOnceMessage: {
                    message: {
                        messageContextInfo: {
                            deviceListMetadata: {},
                            deviceListMetadataVersion: 2,
                        },
                        interactiveMessage: baileys_1.proto.Message.InteractiveMessage.create({
                            body: baileys_1.proto.Message.InteractiveMessage.Body.create({
                                text: data.text || '',
                            }),
                            footer: baileys_1.proto.Message.InteractiveMessage.Footer.create({
                                text: data.footer || '',
                            }),
                            header: baileys_1.proto.Message.InteractiveMessage.Header.create({
                                title: '',
                                subtitle: '',
                                hasMediaAttachment: false,
                            }),
                            nativeFlowMessage: baileys_1.proto.Message.InteractiveMessage.NativeFlowMessage.create({
                                buttons: data.buttons.map((btn) => ({
                                    name: 'quick_reply',
                                    buttonParamsJson: JSON.stringify({
                                        display_text: btn.buttonText.displayText,
                                        id: btn.buttonId,
                                    }),
                                })),
                            }),
                        }),
                    },
                },
            }, { userJid: jid });
            return await this.socket.relayMessage(jid, message.message, {
                messageId: message.key.id,
            });
        };
        enhancedSocket.sendInteractiveList = async (jid, data) => {
            if (!data.listMessage) {
                throw new Error('List message data is required');
            }
            const list = data.listMessage;
            const sections = list.sections.map((section) => ({
                title: section.title,
                rows: section.rows.map((row) => ({
                    header: row.title,
                    title: row.title,
                    description: row.description || '',
                    id: row.rowId,
                })),
            }));
            const message = (0, baileys_1.generateWAMessageFromContent)(jid, {
                viewOnceMessage: {
                    message: {
                        messageContextInfo: {
                            deviceListMetadata: {},
                            deviceListMetadataVersion: 2,
                        },
                        interactiveMessage: baileys_1.proto.Message.InteractiveMessage.create({
                            body: baileys_1.proto.Message.InteractiveMessage.Body.create({
                                text: data.text || list.description || '',
                            }),
                            footer: baileys_1.proto.Message.InteractiveMessage.Footer.create({
                                text: data.footer || '',
                            }),
                            header: baileys_1.proto.Message.InteractiveMessage.Header.create({
                                title: list.title,
                                subtitle: '',
                                hasMediaAttachment: false,
                            }),
                            nativeFlowMessage: baileys_1.proto.Message.InteractiveMessage.NativeFlowMessage.create({
                                buttons: [
                                    {
                                        name: 'single_select',
                                        buttonParamsJson: JSON.stringify({
                                            title: list.buttonText,
                                            sections: sections,
                                        }),
                                    },
                                ],
                            }),
                        }),
                    },
                },
            }, { userJid: jid });
            return await this.socket.relayMessage(jid, message.message, {
                messageId: message.key.id,
            });
        };
        enhancedSocket.sendPoll = async (jid, question, options) => {
            if (options.length < 2 || options.length > 12) {
                throw new Error('Poll must have between 2 and 12 options');
            }
            return await this.socket.sendMessage(jid, {
                poll: {
                    name: question,
                    values: options,
                    selectableCount: 1,
                },
            });
        };
        enhancedSocket.getAdminStats = () => {
            const cacheStats = this.cache.getStats();
            return {
                messageCount: this.messageCount,
                blockedSpam: this.antiSpam.getBlockedCount(),
                rateLimitHits: this.rateLimiter.getHits(),
                uptime: Date.now() - this.startTime,
                cacheHits: cacheStats.hits,
                cacheMisses: cacheStats.misses,
            };
        };
        enhancedSocket.enableAntiSpam = (enabled) => {
            this.config.enableAntiSpam = enabled;
        };
        enhancedSocket.setRateLimit = (max, window) => {
            this.rateLimiter.setLimits(max, window);
        };
        return enhancedSocket;
    }
    getPluginManager() {
        return this.pluginManager;
    }
    getCache() {
        return this.cache;
    }
    getCompressor() {
        return this.compressor;
    }
    getTaskQueue() {
        return this.taskQueue;
    }
    getThrottler() {
        return this.throttler;
    }
}
exports.SoblendBaileys = SoblendBaileys;
