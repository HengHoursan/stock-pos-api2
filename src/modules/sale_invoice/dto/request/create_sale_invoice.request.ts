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

export class CreateSaleInvoiceDetailItem {
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
  saleOrderId?: number;

  @IsNumber()
  @IsOptional()
  saleOrderDetailId?: number;
}

export class CreateSaleInvoiceRequest {
  @IsString()
  @IsOptional()
  code?: string;

  @IsNumber()
  @IsNotEmpty()
  customerId: number;

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
  @Type(() => CreateSaleInvoiceDetailItem)
  details: CreateSaleInvoiceDetailItem[];
}
