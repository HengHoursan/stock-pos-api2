import { Module } from '@nestjs/common';
import { CloudinaryService } from './service/cloudinary.service';

@Module({
  providers: [CloudinaryService],
  exports: [CloudinaryService],
})
export class CloudinaryModule {}
