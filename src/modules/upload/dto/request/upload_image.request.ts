import { ApiProperty } from '@nestjs/swagger';

export class UploadImageRequest {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Upload image (PNG, JPG, JPEG, WEBP, max 5MB)',
  })
  image: Express.Multer.File;
}