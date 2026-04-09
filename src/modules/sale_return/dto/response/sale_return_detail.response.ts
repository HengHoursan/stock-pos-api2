import { Expose, Type } from 'class-transformer';
import { ProductResponse } from '@/product/dto';

export class SaleReturnDetailResponse {
  @Expose()
  id: number;

  @Expose()
  productId: number;

  @Expose()
  quantity: number;

  @Expose()
  unitPrice: number;

  @Expose()
  totalPrice: number;

  @Expose()
  @Type(() => ProductResponse)
  product: ProductResponse;
}
