import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateCurrencyRequest {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  country: string;

  @IsString()
  @IsNotEmpty()
  currency: string;

  @IsString()
  @IsOptional()
  symbol: string;

  @IsString()
  @IsOptional()
  thousandSeparator: string = ',';

  @IsString()
  @IsOptional()
  decimalSeparator: string = '.';

  @IsBoolean()
  @IsOptional()
  status: boolean = true;
}
