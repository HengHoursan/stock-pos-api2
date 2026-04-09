import { Expose, Type } from 'class-transformer';
import { SupplierResponse } from '@/supplier/dto';
import { PurchasePaymentDetailResponse } from './purchase_payment_detail.response';

export class PurchasePaymentResponse {
  @Expose()
  id: number;

  @Expose()
  code: string;

  @Expose()
  supplierId: number;

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
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  @Type(() => SupplierResponse)
  supplier: SupplierResponse;

  @Expose()
  @Type(() => PurchasePaymentDetailResponse)
  details: PurchasePaymentDetailResponse[];
}
