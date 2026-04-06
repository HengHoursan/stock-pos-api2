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

export class UpdateSaleInvoiceDetailItem {
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
  saleOrderId?: number;

  @IsNumber()
  @IsOptional()
  saleOrderDetailId?: number;
}

export class UpdateSaleInvoiceRequest {
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
  @Type(() => UpdateSaleInvoiceDetailItem)
  @IsOptional()
  details?: UpdateSaleInvoiceDetailItem[];
}
