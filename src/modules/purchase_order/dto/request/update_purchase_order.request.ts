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

export class UpdatePurchaseOrderDetailItem {
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

export class UpdatePurchaseOrderRequest {
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @IsString()
  @IsOptional()
  code?: string;

  @IsNumber()
  @IsOptional()
  supplierId?: number;

  @IsDateString()
  @IsOptional()
  orderDate?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdatePurchaseOrderDetailItem)
  @IsOptional()
  details?: UpdatePurchaseOrderDetailItem[];
}
