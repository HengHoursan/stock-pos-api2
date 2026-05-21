import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  ValidateNested,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

class CreateSaleQuotationDetailRequest {
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

export class CreateSaleQuotationRequest {
  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsNumber()
  customerId?: number;

  @IsNotEmpty()
  @IsDateString()
  quotationDate: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSaleQuotationDetailRequest)
  details: CreateSaleQuotationDetailRequest[];
}
