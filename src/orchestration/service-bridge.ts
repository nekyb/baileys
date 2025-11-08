import { ServiceOrchestrator } from 'myklorejs';

export interface ServiceConfig {
  name: string;
  baseUrl: string;
  endpoints: Record<string, string>;
  timeout?: number;
}

export interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
  serviceName: string;
}

export class MicroserviceBridge {
  private orchestrator: ServiceOrchestrator;
  private services: Map<string, ServiceConfig>;

  constructor() {
    this.orchestrator = new ServiceOrchestrator();
    this.services = new Map();
  }

  registerService(config: ServiceConfig): void {
    this.services.set(config.name, config);
  }

  async callService<T = any>(
    serviceName: string,
    endpoint: string,
    data?: any
  ): Promise<ServiceResponse<T>> {
    const startTime = Date.now();
    
    try {
      const response = await this.orchestrator.callService(serviceName, endpoint, data);
      
      return {
        success: true,
        data: response,
        timestamp: Date.now() - startTime,
        serviceName,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        timestamp: Date.now() - startTime,
        serviceName,
      };
    }
  }

  async processAIMessage(message: string, userId: string): Promise<ServiceResponse<string>> {
    return this.callService('ai-service', '/chat', {
      message,
      userId,
      timestamp: Date.now(),
    });
  }

  async analyzeImage(imageBuffer: Buffer, userId: string): Promise<ServiceResponse> {
    return this.callService('vision-service', '/analyze', {
      image: imageBuffer.toString('base64'),
      userId,
    });
  }

  async translateText(text: string, targetLang: string): Promise<ServiceResponse<string>> {
    return this.callService('translation-service', '/translate', {
      text,
      targetLang,
    });
  }

  async moderateContent(content: string, type: 'text' | 'image'): Promise<ServiceResponse<{
    isSafe: boolean;
    categories: string[];
    score: number;
  }>> {
    return this.callService('moderation-service', '/moderate', {
      content,
      type,
    });
  }

  async generateSpeech(text: string, voice: string = 'default'): Promise<ServiceResponse<Buffer>> {
    return this.callService('tts-service', '/generate', {
      text,
      voice,
    });
  }

  async transcribeAudio(audioBuffer: Buffer, language: string = 'es'): Promise<ServiceResponse<{
    text: string;
    language: string;
    confidence: number;
    duration: number;
  }>> {
    return this.callService('stt-service', '/transcribe', {
      audio: audioBuffer.toString('base64'),
      language,
      model: 'whisper-1',
    });
  }

  async transcribeAudioLocal(audioBuffer: Buffer): Promise<string> {
    // Implementación local básica sin servicios externos
    // Retorna placeholder - requiere integración con Whisper local o API
    return '[Audio transcription placeholder - configure STT service]';
  }

  async analyzesentiment(text: string): Promise<ServiceResponse<{
    sentiment: 'positive' | 'negative' | 'neutral';
    score: number;
    emotions: Record<string, number>;
  }>> {
    return this.callService('sentiment-service', '/analyze', {
      text,
    });
  }

  async detectLanguage(text: string): Promise<ServiceResponse<{
    language: string;
    confidence: number;
  }>> {
    return this.callService('language-detection', '/detect', {
      text,
    });
  }

  async generateImage(prompt: string, style?: string): Promise<ServiceResponse<string>> {
    return this.callService('image-gen-service', '/generate', {
      prompt,
      style: style || 'realistic',
    });
  }

  async searchWeb(query: string, limit: number = 10): Promise<ServiceResponse<any[]>> {
    return this.callService('search-service', '/search', {
      query,
      limit,
    });
  }

  async getWeather(location: string): Promise<ServiceResponse<{
    temperature: number;
    condition: string;
    humidity: number;
    forecast: any[];
  }>> {
    return this.callService('weather-service', '/current', {
      location,
    });
  }

  async sendNotification(userId: string, message: string, type: string = 'info'): Promise<ServiceResponse> {
    return this.callService('notification-service', '/send', {
      userId,
      message,
      type,
    });
  }

  getServiceStats(serviceName: string): any {
    return {
      serviceName,
      registered: this.services.has(serviceName),
      config: this.services.get(serviceName),
    };
  }

  getAllServices(): string[] {
    return Array.from(this.services.keys());
  }
}
