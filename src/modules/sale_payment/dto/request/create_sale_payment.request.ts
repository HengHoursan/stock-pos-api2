import { IsNotEmpty, IsString, IsOptional, IsNumber, IsArray, ValidateNested, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

class CreateSalePaymentDetailRequest {
  @IsNotEmpty()
  @IsNumber()
  saleInvoiceId: number;

  @IsNotEmpty()
  @IsNumber()
  paidAmount: number;
}

export class CreateSalePaymentRequest {
  @IsOptional()
  @IsString()
  code?: string;

  @IsNotEmpty()
  @IsNumber()
  customerId: number;

  @IsNotEmpty()
  @IsDateString()
  paymentDate: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateSalePaymentDetailRequest)
  details?: CreateSalePaymentDetailRequest[];
}
