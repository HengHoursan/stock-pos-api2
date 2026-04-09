import { Expose, Type } from 'class-transformer';

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
}
