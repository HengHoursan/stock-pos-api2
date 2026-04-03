import { IsBoolean, IsNotEmpty, IsNumber } from 'class-validator';

export class UpdateCustomerStatusRequest {
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @IsBoolean()
  @IsNotEmpty()
  status: boolean;
}
