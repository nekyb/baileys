"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaCompressor = void 0;
const sharp_1 = __importDefault(require("sharp"));
const fs_1 = require("fs");
class MediaCompressor {
    quality;
    constructor(quality = 80) {
        this.quality = quality;
    }
    async compressImage(input, options) {
        const imageBuffer = typeof input === 'string' ? (0, fs_1.readFileSync)(input) : input;
        const maxWidth = options?.maxWidth || 1920;
        const maxHeight = options?.maxHeight || 1080;
        const format = options?.format || 'jpeg';
        try {
            const image = (0, sharp_1.default)(imageBuffer);
            const metadata = await image.metadata();
            let pipeline = image;
            if (metadata.width && metadata.width > maxWidth || metadata.height && metadata.height > maxHeight) {
                pipeline = pipeline.resize(maxWidth, maxHeight, {
                    fit: 'inside',
                    withoutEnlargement: true,
                });
            }
            if (format === 'jpeg') {
                return await pipeline.jpeg({ quality: this.quality }).toBuffer();
            }
            else if (format === 'png') {
                return await pipeline.png({ compressionLevel: 9 }).toBuffer();
            }
            else if (format === 'webp') {
                return await pipeline.webp({ quality: this.quality }).toBuffer();
            }
            return await pipeline.toBuffer();
        }
        catch (error) {
            throw new Error(`Failed to compress image: ${error}`);
        }
    }
    async generateThumbnail(input, size = 200) {
        const imageBuffer = typeof input === 'string' ? (0, fs_1.readFileSync)(input) : input;
        try {
            return await (0, sharp_1.default)(imageBuffer)
                .resize(size, size, {
                fit: 'cover',
                position: 'center',
            })
                .jpeg({ quality: 70 })
                .toBuffer();
        }
        catch (error) {
            throw new Error(`Failed to generate thumbnail: ${error}`);
        }
    }
}
exports.MediaCompressor = MediaCompressor;
