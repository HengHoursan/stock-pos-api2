import { IsNotEmpty, IsNumber, IsOptional, IsString, IsDateString, IsEnum } from 'class-validator';
import { TransactionType } from '@/common/enum/transaction_type.enum';

export class UpdateTransactionRequest {
  @IsNotEmpty()
  @IsNumber()
  id: number;

  @IsOptional()
  @IsDateString()
  transactionDate?: string;

  @IsOptional()
  @IsEnum(TransactionType)
  transactionType?: TransactionType;

  @IsOptional()
  @IsString()
  remarks?: string;
}
