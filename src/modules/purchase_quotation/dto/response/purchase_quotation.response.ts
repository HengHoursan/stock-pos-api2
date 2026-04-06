import { Expose, Type } from 'class-transformer';
import { PurchaseQuotationDetailResponse } from './purchase_quotation_detail.response';

export class PurchaseQuotationResponse {
  @Expose()
  id: number;

  @Expose()
  code: string;

  @Expose()
  quotationDate: Date;

  @Expose()
  totalLine: number;

  @Expose()
  totalPrice: number;

  @Expose()
  description: string;

  @Expose()
  @Type(() => PurchaseQuotationDetailResponse)
  details: PurchaseQuotationDetailResponse[];

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
