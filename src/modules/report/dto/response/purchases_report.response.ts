import { Expose, Type } from 'class-transformer';
import { PaginationResponse } from '@/common/dto';

class PurchasesBySupplierDataResponse {
  @Expose()
  supplierName: string;

  @Expose()
  totalSpent: number;

  @Expose()
  totalInvoices: number;
}

export class PurchasesReportResponse {
  @Expose()
  totalExpenses: number;

  @Expose()
  @Type(() => PaginationResponse)
  purchasesBySupplier: PaginationResponse<PurchasesBySupplierDataResponse>;
}
