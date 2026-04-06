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

export class UpdateSaleOrderDetailItem {
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

  @IsNumber()
  @IsOptional()
  purchaseQuotationId?: number;

  @IsNumber()
  @IsOptional()
  purchaseQuotationDetailId?: number;
}

export class UpdateSaleOrderRequest {
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @IsString()
  @IsOptional()
  code?: string;

  @IsNumber()
  @IsOptional()
  customerId?: number;

  @IsDateString()
  @IsOptional()
  orderDate?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateSaleOrderDetailItem)
  @IsOptional()
  details?: UpdateSaleOrderDetailItem[];
}
