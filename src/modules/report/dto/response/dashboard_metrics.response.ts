import { Expose, Type } from 'class-transformer';

class StatResponse {
  @Expose()
  total: number;

  @Expose()
  addedThisMonth: number;
}

class DashboardGroupResponse {
  @Expose()
  @Type(() => StatResponse)
  customers?: StatResponse;

  @Expose()
  @Type(() => StatResponse)
  salePayments?: StatResponse;

  @Expose()
  @Type(() => StatResponse)
  saleReturns?: StatResponse;

  @Expose()
  @Type(() => StatResponse)
  transactions?: StatResponse;

  @Expose()
  @Type(() => StatResponse)
  purchasePayments?: StatResponse;

  @Expose()
  @Type(() => StatResponse)
  purchaseReturns?: StatResponse;

  @Expose()
  @Type(() => StatResponse)
  products?: StatResponse;

  @Expose()
  @Type(() => StatResponse)
  suppliers?: StatResponse;
}

export class DashboardMetricsResponse {
  @Expose()
  @Type(() => DashboardGroupResponse)
  pos: DashboardGroupResponse;

  @Expose()
  @Type(() => DashboardGroupResponse)
  stock: DashboardGroupResponse;

  @Expose()
  @Type(() => DashboardGroupResponse)
  inventory: DashboardGroupResponse;
}
