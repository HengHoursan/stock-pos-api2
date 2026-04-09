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

class UpdateSaleReturnDetailRequest {
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

export class UpdateSaleReturnRequest {
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
  returnDate?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => UpdateSaleReturnDetailRequest)
  details?: UpdateSaleReturnDetailRequest[];
}
