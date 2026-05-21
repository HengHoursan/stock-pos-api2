import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsNumber,
} from 'class-validator';

export class UpdateCurrencyRequest {
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsString()
  @IsOptional()
  symbol?: string;

  @IsString()
  @IsOptional()
  thousandSeparator?: string;

  @IsString()
  @IsOptional()
  decimalSeparator?: string;

  @IsBoolean()
  @IsOptional()
  status?: boolean;

  @IsNumber()
  @IsOptional()
  exchangeRate?: number;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
