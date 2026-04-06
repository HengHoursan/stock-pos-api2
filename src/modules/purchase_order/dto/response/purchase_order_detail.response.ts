import { Expose } from 'class-transformer';

export class PurchaseOrderDetailResponse {
  @Expose()
  id: number;

  @Expose()
  purchaseOrderId: number;

  @Expose()
  productId: number;

  @Expose()
  quantity: number;

  @Expose()
  totalPrice: number;

  @Expose()
  purchaseQuotationId: number;

  @Expose()
  purchaseQuotationDetailId: number;
}
