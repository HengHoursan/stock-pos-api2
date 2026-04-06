import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { PurchaseOrderDetail } from '../entity/purchase_order_detail.entity';

@Injectable()
export class PurchaseOrderDetailRepository extends Repository<PurchaseOrderDetail> {
  constructor(private dataSource: DataSource) {
    super(PurchaseOrderDetail, dataSource.createEntityManager());
  }
}
