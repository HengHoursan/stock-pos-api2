import { Expose, Type } from 'class-transformer';
import { CustomerResponse } from '@/customer/dto';
import { SalePaymentDetailResponse } from './sale_payment_detail.response';

export class SalePaymentResponse {
  @Expose()
  id: number;

  @Expose()
  code: string;

  @Expose()
  customerId: number;

  @Expose()
  totalPrice: number;

  @Expose()
  paidAmount: number;

  @Expose()
  paymentDate: Date;

  @Expose()
  description: string;

  @Expose()
  isCancel: boolean;

  @Expose()
  @Type(() => CustomerResponse)
  customer: CustomerResponse;

  @Expose()
  @Type(() => SalePaymentDetailResponse)
  details: SalePaymentDetailResponse[];

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
