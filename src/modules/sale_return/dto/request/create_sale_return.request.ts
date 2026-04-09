import { IsNotEmpty, IsString, IsOptional, IsNumber, IsArray, ValidateNested, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

class CreateSaleReturnDetailRequest {
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

export class CreateSaleReturnRequest {
  @IsOptional()
  @IsString()
  code?: string;

  @IsNotEmpty()
  @IsNumber()
  customerId: number;

  @IsNotEmpty()
  @IsDateString()
  returnDate: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSaleReturnDetailRequest)
  details: CreateSaleReturnDetailRequest[];
}
