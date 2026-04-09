import { Expose, Type } from 'class-transformer';
import { PurchaseInvoiceResponse } from '@/purchase_invoice/dto';

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

  @Expose()
  @Type(() => PurchaseInvoiceResponse)
  purchaseInvoice: PurchaseInvoiceResponse;
}
