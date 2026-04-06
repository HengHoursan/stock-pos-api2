import { Expose, Type } from 'class-transformer';
import { OrderStatus } from '../../../../common/enum/order_status.enum';
import { PurchaseOrderDetailResponse } from './purchase_order_detail.response';

export class PurchaseOrderResponse {
  @Expose()
  id: number;

  @Expose()
  code: string;

  @Expose()
  supplierId: number;

  @Expose()
  totalLine: number;

  @Expose()
  totalCloseLine: number;

  @Expose()
  totalPrice: number;

  @Expose()
  status: OrderStatus;

  @Expose()
  orderDate: Date;

  @Expose()
  description: string;

  @Expose()
  isCancel: boolean;

  @Expose()
  @Type(() => PurchaseOrderDetailResponse)
  details: PurchaseOrderDetailResponse[];

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
