import { IsArray, IsNumber, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BulkEnumStatusUpdateRequest {
  @ApiProperty({ example: [1, 2, 3], description: 'Array of record IDs' })
  @IsArray()
  @IsNumber({}, { each: true })
  @IsNotEmpty()
  ids: number[];

  @ApiProperty({ example: 'COMPLETED', description: 'Target enum status' })
  @IsString()
  @IsNotEmpty()
  status: string;
}
