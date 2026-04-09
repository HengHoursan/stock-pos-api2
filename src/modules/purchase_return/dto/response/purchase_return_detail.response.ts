import { Expose, Type } from 'class-transformer';
import { ProductResponse } from '@/product/dto';

export class PurchaseReturnDetailResponse {
  @Expose()
  id: number;

  @Expose()
  purchaseReturnId: number;

  @Expose()
  productId: number;

  @Expose()
  quantity: number;

  @Expose()
  totalPrice: number;

  @Expose()
  purchaseInvoiceId: number | null;

  @Expose()
  purchaseInvoiceDetailId: number | null;

  @Expose()
  @Type(() => ProductResponse)
  product: ProductResponse;
}
