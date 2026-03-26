import { IsString, IsNotEmpty, IsNumber, IsOptional, IsBoolean } from 'class-validator';

export class CreateBrandRequest {
  @IsString()
  @IsOptional()
  code: string;

  @IsNumber()
  @IsOptional()
  parentId: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  slug: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsString()
  @IsOptional()
  imageUrl: string;

  @IsBoolean()
  @IsOptional()
  status: boolean = true;
}
