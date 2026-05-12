import { IsArray, IsNumber, IsNotEmpty, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BulkStatusUpdateRequest {
  @ApiProperty({ example: [1, 2, 3], description: 'Array of record IDs' })
  @IsArray()
  @IsNumber({}, { each: true })
  @IsNotEmpty()
  ids: number[];

  @ApiProperty({ example: true, description: 'Target status' })
  @IsBoolean()
  @IsNotEmpty()
  status: boolean;
}
