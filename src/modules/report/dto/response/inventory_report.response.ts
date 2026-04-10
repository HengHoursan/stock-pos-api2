import { Expose, Type } from 'class-transformer';
import { PaginationResponse } from '@/common/dto';

class LowStockAlertDataResponse {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  code: string;

  @Expose()
  currentStock: number;

  @Expose()
  alertQuantity: number;
}

export class InventoryReportResponse {
  @Expose()
  currentStockLevels: number;

  @Expose()
  stockValuation: number;

  @Expose()
  @Type(() => PaginationResponse)
  lowStockAlerts: PaginationResponse<LowStockAlertDataResponse>;
}
