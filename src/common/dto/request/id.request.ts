import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class IdRequest {
  @ApiProperty({ example: 1, description: 'The ID of the resource' })
  @IsNumber()
  @IsNotEmpty()
  id: number;
}
