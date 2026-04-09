import { Expose, Type } from 'class-transformer';
import { PurchaseReturnDetailResponse } from './purchase_return_detail.response';
import { InvoiceStatus } from '../../../../common/enum/invoice_status.enum';

export class PurchaseReturnResponse {
  @Expose()
  id: number;

  @Expose()
  code: string;

  @Expose()
  supplierId: number;

  @Expose()
  totalLine: number;

  @Expose()
  totalPrice: number;

  @Expose()
  status: InvoiceStatus;

  @Expose()
  returnDate: Date;

  @Expose()
  description: string;

  @Expose()
  isCancel: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  @Type(() => PurchaseReturnDetailResponse)
  details: PurchaseReturnDetailResponse[];
}
