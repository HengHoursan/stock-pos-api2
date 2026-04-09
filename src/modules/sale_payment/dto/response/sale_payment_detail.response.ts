import { Expose, Type } from 'class-transformer';
import { SaleInvoiceResponse } from '@/sale_invoice/dto';

export class SalePaymentDetailResponse {
  @Expose()
  id: number;

  @Expose()
  saleInvoiceId: number;

  @Expose()
  paidAmount: number;

  @Expose()
  @Type(() => SaleInvoiceResponse)
  saleInvoice: SaleInvoiceResponse;
}
