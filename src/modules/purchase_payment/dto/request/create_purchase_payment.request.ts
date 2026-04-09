import {
  IsString,
  IsOptional,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsArray,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePurchasePaymentDetailItem {
  @IsNumber()
  @Min(0)
  totalPrice: number;

  @IsNumber()
  @IsOptional()
  purchaseInvoiceId?: number;

  @IsNumber()
  @IsOptional()
  purchaseInvoiceDetailId?: number;
}

export class CreatePurchasePaymentRequest {
  @IsString()
  @IsOptional()
  code?: string;

  @IsNumber()
  @IsNotEmpty()
  supplierId: number;

  @IsDateString()
  @IsNotEmpty()
  paymentDate: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  paidAmount?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePurchasePaymentDetailItem)
  details: CreatePurchasePaymentDetailItem[];
}
