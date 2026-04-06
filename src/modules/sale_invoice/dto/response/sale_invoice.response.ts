import { Expose, Type } from 'class-transformer';
import { InvoiceStatus } from '../../../../common/enum/invoice_status.enum';
import { PaymentMethod } from '../../../../common/enum/payment_method.enum';
import { SaleInvoiceDetailResponse } from './sale_invoice_detail.response';

export class SaleInvoiceResponse {
  @Expose()
  id: number;

  @Expose()
  code: string;

  @Expose()
  customerId: number;

  @Expose()
  totalLine: number;

  @Expose()
  totalPrice: number;

  @Expose()
  paidAmount: number;

  @Expose()
  status: InvoiceStatus;

  @Expose()
  invoiceDate: Date;

  @Expose()
  description: string;

  @Expose()
  isCancel: boolean;

  @Expose()
  paymentMethod: PaymentMethod;

  @Expose()
  @Type(() => SaleInvoiceDetailResponse)
  details: SaleInvoiceDetailResponse[];

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
