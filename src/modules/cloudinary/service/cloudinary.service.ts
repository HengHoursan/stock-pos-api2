import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';

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
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream((error, result) => {
        if (error) return reject(error);
        resolve(result!);
      }).end(file.buffer);
    });
  }
}
