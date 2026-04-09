import { Expose, Type } from 'class-transformer';
import { CustomerResponse } from '@/customer/dto';
import { InvoiceStatus } from '@/common/enum/invoice_status.enum';
import { SaleReturnDetailResponse } from './sale_return_detail.response';

export class SaleReturnResponse {
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
  status: InvoiceStatus;

  @Expose()
  returnDate: Date;

  @Expose()
  description: string;

  @Expose()
  isCancel: boolean;

  @Expose()
  @Type(() => CustomerResponse)
  customer: CustomerResponse;

  @Expose()
  @Type(() => SaleReturnDetailResponse)
  details: SaleReturnDetailResponse[];

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
