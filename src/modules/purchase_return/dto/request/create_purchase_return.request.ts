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

export class CreatePurchaseReturnDetailItem {
  @IsNumber()
  @IsNotEmpty()
  productId: number;

  @IsNumber()
  @Min(0)
  quantity: number;

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

export class CreatePurchaseReturnRequest {
  @IsString()
  @IsOptional()
  code?: string;

  @IsNumber()
  @IsNotEmpty()
  supplierId: number;

  @IsDateString()
  @IsNotEmpty()
  returnDate: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePurchaseReturnDetailItem)
  details: CreatePurchaseReturnDetailItem[];
}
