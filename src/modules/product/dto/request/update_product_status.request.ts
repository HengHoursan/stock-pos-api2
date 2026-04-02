import { IsBoolean, IsNotEmpty, IsNumber } from 'class-validator';

export class UpdateProductStatusRequest {
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @IsBoolean()
  @IsNotEmpty()
  status: boolean;
}
