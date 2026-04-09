import { Expose, Type } from 'class-transformer';

export class PurchasePaymentDetailResponse {
  @Expose()
  id: number;

  @Expose()
  purchasePaymentId: number;

  @Expose()
  totalPrice: number;

  @Expose()
  purchaseInvoiceId: number | null;

  @Expose()
  purchaseInvoiceDetailId: number | null;
}
