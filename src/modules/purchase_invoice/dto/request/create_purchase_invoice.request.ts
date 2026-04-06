import {
  IsString,
  IsOptional,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsArray,
  IsEnum,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '../../../../common/enum/payment_method.enum';

export class CreatePurchaseInvoiceDetailItem {
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

export class CreatePurchaseInvoiceRequest {
  @IsString()
  @IsOptional()
  code?: string;

  @IsNumber()
  @IsNotEmpty()
  supplierId: number;

  @IsDateString()
  @IsNotEmpty()
  invoiceDate: string;

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
  @Type(() => CreatePurchaseInvoiceDetailItem)
  details: CreatePurchaseInvoiceDetailItem[];
}
