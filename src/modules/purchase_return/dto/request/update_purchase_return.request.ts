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
import { CreatePurchaseReturnDetailItem } from './create_purchase_return.request';

export class UpdatePurchaseReturnRequest {
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
  returnDate?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreatePurchaseReturnDetailItem)
  details?: CreatePurchaseReturnDetailItem[];
}
