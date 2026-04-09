import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
import { InvoiceStatus } from '../../../../common/enum/invoice_status.enum';

export class UpdatePurchaseReturnStatusRequest {
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @IsEnum(InvoiceStatus)
  @IsNotEmpty()
  status: InvoiceStatus;
}
