import { 
  IsString, 
  IsNotEmpty, 
  IsNumber, 
  IsOptional, 
  IsBoolean, 
  IsEnum, 
  IsDateString, 
  Min 
} from 'class-validator';

export class CreateProductRequest {
  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  categoryId: number;

  @IsNumber()
  @IsOptional()
  brandId?: number;

  @IsNumber()
  @IsNotEmpty()
  unitId: number;

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
  status: boolean = true;

  @IsBoolean()
  @IsOptional()
  forSelling: boolean = true;

  @IsBoolean()
  @IsOptional()
  isManufacture: boolean = false;

  @IsBoolean()
  @IsOptional()
  manageStock: boolean = true;

  // Initial Product Detail fields
  @IsNumber()
  @IsOptional()
  @Min(0)
  currentStock?: number = 0;

  @IsString()
  @IsOptional()
  stockNumber?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  purchasePrice?: number = 0;

  @IsNumber()
  @IsOptional()
  @Min(0)
  salePrice?: number = 0;

  @IsDateString()
  @IsOptional()
  expiryDate?: string;

  @IsString()
  @IsOptional()
  expiryType?: string;
}
