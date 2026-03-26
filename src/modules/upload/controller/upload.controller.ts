import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiBody } from '@nestjs/swagger';
import { Permissions } from '@/common/security/decorator/permissions.decorator';
import { CloudinaryService } from '@/cloudinary/service/cloudinary.service';
import { ApiResponse } from '@/common/dto';
import { UploadResponse, UploadImageRequest } from '@/upload/dto';
import { plainToInstance } from 'class-transformer';

@Controller('upload')
export class UploadController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Post('image')
  @Permissions('upload:image')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Image file to upload',
    type: UploadImageRequest,
  })
  @UseInterceptors(FileInterceptor('image'))
  async uploadImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: 'image/(png|jpeg|jpg|webp)' }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const uploaded = await this.cloudinaryService.uploadImage(file);
    const responseDto = plainToInstance(UploadResponse, {
      imageUrl: (uploaded as any).secure_url,
    });
    return ApiResponse.success(responseDto, 'Image uploaded successfully');
  }
}
