import { IsNumber, IsNotEmpty, IsEnum } from 'class-validator';
import { InvoiceStatus } from '../../../../common/enum/invoice_status.enum';

export class UpdateSaleInvoiceStatusRequest {
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @IsEnum(InvoiceStatus)
  @IsNotEmpty()
  status: InvoiceStatus;
}
