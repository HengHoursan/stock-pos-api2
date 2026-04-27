import { Expose, Type } from 'class-transformer';
import { ProductResponse } from '@/product/dto';

export class SaleInvoiceDetailResponse {
  @Expose()
  id: number;

  @Expose()
  saleInvoiceId: number;

  @Expose()
  productId: number;

  @Expose()
  quantity: number;

  @Expose()
  totalPrice: number;

  @Expose()
  saleOrderId: number;

  @Expose()
  saleOrderDetailId: number;

  @Expose()
  @Type(() => ProductResponse)
  product: ProductResponse;
}
