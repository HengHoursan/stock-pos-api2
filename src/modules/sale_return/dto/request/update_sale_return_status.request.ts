import { IsNotEmpty, IsNumber, IsEnum } from 'class-validator';
import { InvoiceStatus } from '@/common/enum/invoice_status.enum';

export class UpdateSaleReturnStatusRequest {
  @IsNotEmpty()
  @IsNumber()
  id: number;

  @IsNotEmpty()
  @IsEnum(InvoiceStatus)
  status: InvoiceStatus;
}
