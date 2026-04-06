import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { SaleOrderDetail } from '../entity/sale_order_detail.entity';

@Injectable()
export class SaleOrderDetailRepository extends Repository<SaleOrderDetail> {
  constructor(private dataSource: DataSource) {
    super(SaleOrderDetail, dataSource.createEntityManager());
  }
}
