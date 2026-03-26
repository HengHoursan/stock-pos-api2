import { IsBoolean, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class UpdateCategoryStatusRequest {
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @IsBoolean()
  @IsOptional()
  status: boolean = true;
}
