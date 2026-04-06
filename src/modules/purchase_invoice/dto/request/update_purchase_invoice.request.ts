import {
  IsString,
  IsOptional,
  IsDateString,
  IsNumber,
  IsNotEmpty,
  IsArray,
  IsEnum,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '../../../../common/enum/payment_method.enum';

export class UpdatePurchaseInvoiceDetailItem {
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
  purchaseOrderId?: number;

  @IsNumber()
  @IsOptional()
  purchaseOrderDetailId?: number;
}

export class UpdatePurchaseInvoiceRequest {
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
  invoiceDate?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  paidAmount?: number;

  @IsEnum(PaymentMethod)
  @IsOptional()
  paymentMethod?: PaymentMethod;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdatePurchaseInvoiceDetailItem)
  @IsOptional()
  details?: UpdatePurchaseInvoiceDetailItem[];
}
