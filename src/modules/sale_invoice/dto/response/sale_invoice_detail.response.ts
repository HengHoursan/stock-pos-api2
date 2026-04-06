import { Expose } from 'class-transformer';

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
}
