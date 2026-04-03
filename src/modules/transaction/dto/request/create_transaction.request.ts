import { IsNotEmpty, IsNumber, IsEnum, IsOptional, IsString, IsDateString } from 'class-validator';
import { TransactionType } from '@/common/enum/transaction_type.enum';

export class CreateTransactionRequest {
  @IsOptional()
  @IsString()
  transactionCode?: string;

  @IsNotEmpty()
  @IsDateString()
  transactionDate: string;

  @IsNotEmpty()
  @IsEnum(TransactionType)
  transactionType: TransactionType;

  @IsNotEmpty()
  @IsNumber()
  productId: number;

  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @IsOptional()
  @IsString()
  remarks?: string;
}
