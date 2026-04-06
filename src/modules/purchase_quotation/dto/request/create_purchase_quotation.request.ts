import {
  IsString,
  IsOptional,
  IsDateString,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePurchaseQuotationDetailItem {
  @IsNumber()
  @IsNotEmpty()
  productId: number;

  @IsNumber()
  @Min(0)
  quantity: number;

  @IsNumber()
  @Min(0)
  totalPrice: number;
}

export class CreatePurchaseQuotationRequest {
  @IsString()
  @IsOptional()
  code?: string;

  @IsDateString()
  @IsNotEmpty()
  quotationDate: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePurchaseQuotationDetailItem)
  details: CreatePurchaseQuotationDetailItem[];
}
