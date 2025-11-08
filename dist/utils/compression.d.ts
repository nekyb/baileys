export declare class MediaCompressor {
    private quality;
    constructor(quality?: number);
    compressImage(input: Buffer | string, options?: {
        maxWidth?: number;
        maxHeight?: number;
        format?: 'jpeg' | 'png' | 'webp';
    }): Promise<Buffer>;
    generateThumbnail(input: Buffer | string, size?: number): Promise<Buffer>;
}
