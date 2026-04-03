import { IsBoolean, IsNotEmpty, IsNumber } from 'class-validator';

export class UpdateSupplierStatusRequest {
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @IsBoolean()
  @IsNotEmpty()
  status: boolean;
}
