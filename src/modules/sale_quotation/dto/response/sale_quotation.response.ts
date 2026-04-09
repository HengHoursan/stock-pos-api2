import { Expose, Type } from 'class-transformer';
import { CustomerResponse } from '@/customer/dto';
import { SaleQuotationDetailResponse } from './sale_quotation_detail.response';

export class SaleQuotationResponse {
  @Expose()
  id: number;

  @Expose()
  code: string;

  @Expose()
  customerId: number;

  @Expose()
  quotationDate: Date;

  @Expose()
  totalLine: number;

  @Expose()
  totalPrice: number;

  @Expose()
  description: string;

  @Expose()
  @Type(() => CustomerResponse)
  customer: CustomerResponse;

  @Expose()
  @Type(() => SaleQuotationDetailResponse)
  details: SaleQuotationDetailResponse[];

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
