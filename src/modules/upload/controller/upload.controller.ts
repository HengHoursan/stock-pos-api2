import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiBody, ApiOperation } from '@nestjs/swagger';
import { CloudinaryService } from '@/cloudinary/service/cloudinary.service';
import { ApiResponse } from '@/common/dto';
import {
  UploadResponse,
  UploadImageRequest,
  UpdateImageRequest,
} from '@/upload/dto';
import { plainToInstance } from 'class-transformer';

@Controller('upload')
export class UploadController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Post('create')
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
      image_url: uploaded.secure_url,
    });
    return ApiResponse.success(responseDto, 'Image uploaded successfully');
  }

  @Post('update')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'New image file and old image URL',
    type: UpdateImageRequest,
  })
  @UseInterceptors(FileInterceptor('new_image'))
  async updateImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: 'image/(png|jpeg|jpg|webp)' }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Body() dto: UpdateImageRequest,
  ) {
    const parts = dto.old_image_url.split('/');
    const filenameWithExtension = parts.pop();
    const publicId = filenameWithExtension?.split('.')[0];
    const folderPath = 'pos-uploads';
    const fullPublicId = `${folderPath}/${publicId}`;

    const uploaded = await this.cloudinaryService.updateImage(
      file,
      fullPublicId,
    );

    const responseDto = plainToInstance(UploadResponse, {
      image_url: (uploaded as any).secure_url,
    });
    return ApiResponse.success(responseDto, 'Image updated successfully');
  }
}
