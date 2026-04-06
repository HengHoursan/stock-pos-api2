import { IsNumber, IsNotEmpty, IsEnum } from 'class-validator';
import { InvoiceStatus } from '../../../../common/enum/invoice_status.enum';

export class UpdatePurchaseInvoiceStatusRequest {
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @IsEnum(InvoiceStatus)
  @IsNotEmpty()
  status: InvoiceStatus;
}
