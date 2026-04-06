import {
  IsString,
  IsOptional,
  IsDateString,
  IsNumber,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdatePurchaseQuotationDetailItem {
  @IsNumber()
  @IsOptional()
  id?: number;

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

export class UpdatePurchaseQuotationRequest {
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @IsString()
  @IsOptional()
  code?: string;

  @IsDateString()
  @IsOptional()
  quotationDate?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdatePurchaseQuotationDetailItem)
  @IsOptional()
  details?: UpdatePurchaseQuotationDetailItem[];
}
