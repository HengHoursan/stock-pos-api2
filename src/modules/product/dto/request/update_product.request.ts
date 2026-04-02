import { 
  IsString, 
  IsNotEmpty, 
  IsNumber, 
  IsOptional, 
  IsBoolean, 
  IsDateString, 
  Min 
} from 'class-validator';

export class UpdateProductRequest {
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsNumber()
  @IsOptional()
  categoryId?: number;

  @IsNumber()
  @IsOptional()
  brandId?: number;

  @IsNumber()
  @IsOptional()
  unitId?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  alertQuantity?: number;

  @IsString()
  @IsOptional()
  skuCode?: string;

  @IsString()
  @IsOptional()
  barcodeType?: string;

  @IsString()
  @IsOptional()
  photoPath?: string;

  @IsBoolean()
  @IsOptional()
  status?: boolean;

  @IsBoolean()
  @IsOptional()
  forSelling?: boolean;

  @IsBoolean()
  @IsOptional()
  isManufacture?: boolean;

  @IsBoolean()
  @IsOptional()
  manageStock?: boolean;

  // Detail updates
  @IsNumber()
  @IsOptional()
  @Min(0)
  currentStock?: number;

  @IsString()
  @IsOptional()
  stockNumber?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  purchasePrice?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  salePrice?: number;

  @IsDateString()
  @IsOptional()
  expiryDate?: string;

  @IsString()
  @IsOptional()
  expiryType?: string;
}
