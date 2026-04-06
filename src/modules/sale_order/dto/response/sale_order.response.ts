import { Expose, Type } from 'class-transformer';
import { OrderStatus } from '../../../../common/enum/order_status.enum';
import { SaleOrderDetailResponse } from './sale_order_detail.response';

export class SaleOrderResponse {
  @Expose()
  id: number;

  @Expose()
  code: string;

  @Expose()
  customerId: number;

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
  @Type(() => SaleOrderDetailResponse)
  details: SaleOrderDetailResponse[];

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
