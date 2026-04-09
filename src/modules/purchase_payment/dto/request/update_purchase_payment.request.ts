import {
  IsString,
  IsOptional,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsArray,
  ValidateNested,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreatePurchasePaymentDetailItem } from './create_purchase_payment.request';

export class UpdatePurchasePaymentRequest {
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @IsString()
  @IsOptional()
  code?: string;

  @IsNumber()
  @IsOptional()
  supplierId?: number;

  @IsDateString()
  @IsOptional()
  paymentDate?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  paidAmount?: number;

  @IsBoolean()
  @IsOptional()
  isCancel?: boolean;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreatePurchasePaymentDetailItem)
  details?: CreatePurchasePaymentDetailItem[];
}
