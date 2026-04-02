import { Expose, Type } from 'class-transformer';
import { CategoryResponse } from '@/category/dto';
import { BrandResponse } from '@/brand/dto';
import { UnitResponse } from '@/unit/dto';
import { ProductDetailResponse } from './product_detail.response';

export class ProductResponse {
  @Expose()
  id: number;

  @Expose()
  code: string;

  @Expose()
  name: string;

  @Expose()
  @Type(() => CategoryResponse)
  category: CategoryResponse;

  @Expose()
  @Type(() => BrandResponse)
  brand: BrandResponse;

  @Expose()
  @Type(() => UnitResponse)
  unit: UnitResponse;

  @Expose()
  alertQuantity: number;

  @Expose()
  skuCode: string;

  @Expose()
  barcodeType: string;

  @Expose()
  photoPath: string;

  @Expose()
  status: boolean;

  @Expose()
  forSelling: boolean;

  @Expose()
  isManufacture: boolean;

  @Expose()
  manageStock: boolean;

  @Expose()
  @Type(() => ProductDetailResponse)
  detail: ProductDetailResponse;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
