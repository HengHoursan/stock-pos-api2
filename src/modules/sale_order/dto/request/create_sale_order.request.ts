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

export class CreateSaleOrderDetailItem {
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
  purchaseQuotationId?: number;

  @IsNumber()
  @IsOptional()
  purchaseQuotationDetailId?: number;
}

export class CreateSaleOrderRequest {
  @IsString()
  @IsOptional()
  code?: string;

  @IsNumber()
  @IsNotEmpty()
  customerId: number;

  @IsDateString()
  @IsNotEmpty()
  orderDate: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSaleOrderDetailItem)
  details: CreateSaleOrderDetailItem[];
}
