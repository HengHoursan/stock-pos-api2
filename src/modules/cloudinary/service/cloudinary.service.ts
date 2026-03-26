import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  v2 as cloudinary,
  UploadApiResponse,
  UploadApiErrorResponse,
} from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get('cloudinary.cloud_name'),
      api_key: this.configService.get('cloudinary.api_key'),
      api_secret: this.configService.get('cloudinary.api_secret'),
    });
  }

  async uploadImage(
    file: Express.Multer.File,
    folder: string = 'pos-uploads',): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: folder,
            use_filename: true,
            unique_filename: true,
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result!);
          },
        )
        .end(file.buffer);
    });
  }

  async deleteImage(publicId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) return reject(error);
        resolve(result);
      });
    });
  }

  async updateImage(
    file: Express.Multer.File,
    oldPublicId: string,
    folder: string = 'pos-uploads',
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    // 1. Upload new image first
    const newImage = await this.uploadImage(file, folder);

    // 2. If upload successful and we have an old ID, delete the old one
    if (newImage && oldPublicId) {
      try {
        await this.deleteImage(oldPublicId);
      } catch (error) {
        console.error('Failed to delete old image from Cloudinary:', error);
      }
    }

    return newImage;
  }
}
