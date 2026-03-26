import { Expose } from 'class-transformer';

export class UploadResponse {
  @Expose()
  image_url: string;
}
