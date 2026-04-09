import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class UpdateDiscountRequest {
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @IsOptional()
  discountType?: string;

  @IsNumber()
  @IsOptional()
  discountAmount?: number;

  @IsString()
  @IsOptional()
  discountStartDate?: string;

  @IsString()
  @IsOptional()
  discountEndDate?: string;
}
