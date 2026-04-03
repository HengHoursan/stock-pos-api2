import { TransactionType } from '@/common/enum/transaction_type.enum';

export class TransactionResponse {
  id: number;
  transactionCode: string;
  transactionDate: Date;
  transactionType: TransactionType;
  productId: number;
  beginningStock: number;
  quantity: number;
  afterStock: number;
  remarks: string | null;
  createdAt: Date;
  updatedAt: Date;
  product?: {
    id: number;
    name: string;
    code: string;
  };
}
