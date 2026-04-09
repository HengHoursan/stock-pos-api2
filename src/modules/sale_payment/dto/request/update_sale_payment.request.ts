import {
  IsString,
  IsOptional,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class UpdateSalePaymentDetailRequest {
  @IsNumber()
  @IsOptional()
  id?: number;

  @IsNotEmpty()
  @IsNumber()
  saleInvoiceId: number;

  @IsNotEmpty()
  @IsNumber()
  paidAmount: number;
}

export class UpdateSalePaymentRequest {
  @IsNotEmpty()
  @IsNumber()
  id: number;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsNumber()
  customerId?: number;

  @IsOptional()
  @IsDateString()
  paymentDate?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => UpdateSalePaymentDetailRequest)
  details?: UpdateSalePaymentDetailRequest[];
}
