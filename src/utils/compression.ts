import sharp from 'sharp';
import { readFileSync } from 'fs';

export class MediaCompressor {
  private quality: number;

  constructor(quality: number = 80) {
    this.quality = quality;
  }

  async compressImage(input: Buffer | string, options?: {
    maxWidth?: number;
    maxHeight?: number;
    format?: 'jpeg' | 'png' | 'webp';
  }): Promise<Buffer> {
    const imageBuffer = typeof input === 'string' ? readFileSync(input) : input;
    const maxWidth = options?.maxWidth || 1920;
    const maxHeight = options?.maxHeight || 1080;
    const format = options?.format || 'jpeg';

    try {
      const image = sharp(imageBuffer);
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
      } else if (format === 'png') {
        return await pipeline.png({ compressionLevel: 9 }).toBuffer();
      } else if (format === 'webp') {
        return await pipeline.webp({ quality: this.quality }).toBuffer();
      }

      return await pipeline.toBuffer();
    } catch (error) {
      throw new Error(`Failed to compress image: ${error}`);
    }
  }

  async generateThumbnail(input: Buffer | string, size: number = 200): Promise<Buffer> {
    const imageBuffer = typeof input === 'string' ? readFileSync(input) : input;

    try {
      return await sharp(imageBuffer)
        .resize(size, size, {
          fit: 'cover',
          position: 'center',
        })
        .jpeg({ quality: 70 })
        .toBuffer();
    } catch (error) {
      throw new Error(`Failed to generate thumbnail: ${error}`);
    }
  }
}
