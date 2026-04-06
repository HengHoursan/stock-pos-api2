import { IsNumber, IsNotEmpty, IsEnum } from 'class-validator';
import { OrderStatus } from '../../../../common/enum/order_status.enum';

export class UpdatePurchaseOrderStatusRequest {
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @IsEnum(OrderStatus)
  @IsNotEmpty()
  status: OrderStatus;
}
