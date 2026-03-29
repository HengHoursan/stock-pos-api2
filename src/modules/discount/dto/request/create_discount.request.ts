import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateDiscountRequest {
  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @IsNotEmpty()
  discountType: string;

  @IsNumber()
  @IsNotEmpty()
  discountAmount: number;

  @IsString()
  @IsNotEmpty()
  discountStartDate: string;

  @IsString()
  @IsNotEmpty()
  discountEndDate: string;
}
