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

class UpdateSaleQuotationDetailRequest {
  @IsNumber()
  @IsOptional()
  id?: number;

  @IsNotEmpty()
  @IsNumber()
  productId: number;

  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @IsNotEmpty()
  @IsNumber()
  unitPrice: number;

  @IsNotEmpty()
  @IsNumber()
  totalPrice: number;
}

export class UpdateSaleQuotationRequest {
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
  quotationDate?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => UpdateSaleQuotationDetailRequest)
  details?: UpdateSaleQuotationDetailRequest[];
}
