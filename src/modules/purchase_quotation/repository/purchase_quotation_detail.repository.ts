import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { PurchaseQuotationDetail } from '../entity/purchase_quotation_detail.entity';

@Injectable()
export class PurchaseQuotationDetailRepository extends Repository<PurchaseQuotationDetail> {
  constructor(private dataSource: DataSource) {
    super(PurchaseQuotationDetail, dataSource.createEntityManager());
  }
}
