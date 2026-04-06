import { Expose } from 'class-transformer';

export class PurchaseInvoiceDetailResponse {
  @Expose()
  id: number;

  @Expose()
  purchaseInvoiceId: number;

  @Expose()
  productId: number;

  @Expose()
  quantity: number;

  @Expose()
  totalPrice: number;

  @Expose()
  purchaseOrderId: number;

  @Expose()
  purchaseOrderDetailId: number;
}
