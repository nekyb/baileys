"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MicroserviceBridge = void 0;
const myklorejs_1 = require("myklorejs");
class MicroserviceBridge {
    orchestrator;
    services;
    constructor() {
        this.orchestrator = new myklorejs_1.ServiceOrchestrator();
        this.services = new Map();
    }
    registerService(config) {
        this.services.set(config.name, config);
    }
    async callService(serviceName, endpoint, data) {
        const startTime = Date.now();
        try {
            const response = await this.orchestrator.callService(serviceName, endpoint, data);
            return {
                success: true,
                data: response,
                timestamp: Date.now() - startTime,
                serviceName,
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                timestamp: Date.now() - startTime,
                serviceName,
            };
        }
    }
    async processAIMessage(message, userId) {
        return this.callService('ai-service', '/chat', {
            message,
            userId,
            timestamp: Date.now(),
        });
    }
    async analyzeImage(imageBuffer, userId) {
        return this.callService('vision-service', '/analyze', {
            image: imageBuffer.toString('base64'),
            userId,
        });
    }
    async translateText(text, targetLang) {
        return this.callService('translation-service', '/translate', {
            text,
            targetLang,
        });
    }
    async moderateContent(content, type) {
        return this.callService('moderation-service', '/moderate', {
            content,
            type,
        });
    }
    async generateSpeech(text, voice = 'default') {
        return this.callService('tts-service', '/generate', {
            text,
            voice,
        });
    }
    async transcribeAudio(audioBuffer, language = 'es') {
        return this.callService('stt-service', '/transcribe', {
            audio: audioBuffer.toString('base64'),
            language,
            model: 'whisper-1',
        });
    }
    async transcribeAudioLocal(audioBuffer) {
        return '[Audio transcription placeholder - configure STT service]';
    }
    async analyzesentiment(text) {
        return this.callService('sentiment-service', '/analyze', {
            text,
        });
    }
    async detectLanguage(text) {
        return this.callService('language-detection', '/detect', {
            text,
        });
    }
    async generateImage(prompt, style) {
        return this.callService('image-gen-service', '/generate', {
            prompt,
            style: style || 'realistic',
        });
    }
    async searchWeb(query, limit = 10) {
        return this.callService('search-service', '/search', {
            query,
            limit,
        });
    }
    async getWeather(location) {
        return this.callService('weather-service', '/current', {
            location,
        });
    }
    async sendNotification(userId, message, type = 'info') {
        return this.callService('notification-service', '/send', {
            userId,
            message,
            type,
        });
    }
    getServiceStats(serviceName) {
        return {
            serviceName,
            registered: this.services.has(serviceName),
            config: this.services.get(serviceName),
        };
    }
    getAllServices() {
        return Array.from(this.services.keys());
    }
}
exports.MicroserviceBridge = MicroserviceBridge;
