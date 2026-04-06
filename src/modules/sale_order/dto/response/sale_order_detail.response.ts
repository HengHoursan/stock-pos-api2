import { Expose } from 'class-transformer';

export class SaleOrderDetailResponse {
  @Expose()
  id: number;

  @Expose()
  saleOrderId: number;

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
