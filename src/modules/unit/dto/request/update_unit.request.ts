import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsBoolean,
  Min,
} from 'class-validator';

export class UpdateUnitRequest {
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @IsString()
  @IsOptional()
  code?: string;

  @IsNumber()
  @IsOptional()
  parentId?: number;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  symbol?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  conversionFactor?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  defaultPrice?: number;

  @IsBoolean()
  @IsOptional()
  isCalculateDetail?: boolean;

  @IsBoolean()
  @IsOptional()
  status?: boolean;
}
