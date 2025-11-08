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
export declare class MicroserviceBridge {
    private orchestrator;
    private services;
    constructor();
    registerService(config: ServiceConfig): void;
    callService<T = any>(serviceName: string, endpoint: string, data?: any): Promise<ServiceResponse<T>>;
    processAIMessage(message: string, userId: string): Promise<ServiceResponse<string>>;
    analyzeImage(imageBuffer: Buffer, userId: string): Promise<ServiceResponse>;
    translateText(text: string, targetLang: string): Promise<ServiceResponse<string>>;
    moderateContent(content: string, type: 'text' | 'image'): Promise<ServiceResponse<{
        isSafe: boolean;
        categories: string[];
        score: number;
    }>>;
    generateSpeech(text: string, voice?: string): Promise<ServiceResponse<Buffer>>;
    transcribeAudio(audioBuffer: Buffer, language?: string): Promise<ServiceResponse<{
        text: string;
        language: string;
        confidence: number;
        duration: number;
    }>>;
    transcribeAudioLocal(audioBuffer: Buffer): Promise<string>;
    analyzesentiment(text: string): Promise<ServiceResponse<{
        sentiment: 'positive' | 'negative' | 'neutral';
        score: number;
        emotions: Record<string, number>;
    }>>;
    detectLanguage(text: string): Promise<ServiceResponse<{
        language: string;
        confidence: number;
    }>>;
    generateImage(prompt: string, style?: string): Promise<ServiceResponse<string>>;
    searchWeb(query: string, limit?: number): Promise<ServiceResponse<any[]>>;
    getWeather(location: string): Promise<ServiceResponse<{
        temperature: number;
        condition: string;
        humidity: number;
        forecast: any[];
    }>>;
    sendNotification(userId: string, message: string, type?: string): Promise<ServiceResponse>;
    getServiceStats(serviceName: string): any;
    getAllServices(): string[];
}
