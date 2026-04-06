import { Expose } from 'class-transformer';

export class PurchaseQuotationDetailResponse {
  @Expose()
  id: number;

  @Expose()
  purchaseQuotationId: number;

  @Expose()
  productId: number;

  @Expose()
  quantity: number;

  @Expose()
  totalPrice: number;
}
