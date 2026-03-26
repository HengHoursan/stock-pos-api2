import { Expose } from 'class-transformer';

export class BrandResponse {
  @Expose()
  id: number;

  @Expose()
  code: string;

  @Expose()
  parentId: number;

  @Expose()
  name: string;

  @Expose()
  slug: string;

  @Expose()
  description: string;

  @Expose()
  imageUrl: string;

  @Expose()
  status: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
