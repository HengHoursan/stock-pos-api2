import { IsArray, IsNumber, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BulkActionRequest {
  @ApiProperty({ example: [1, 2, 3], description: 'Array of record IDs' })
  @IsArray()
  @IsNumber({}, { each: true })
  @IsNotEmpty()
  ids: number[];
}
