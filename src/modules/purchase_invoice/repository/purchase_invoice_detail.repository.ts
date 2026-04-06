import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { PurchaseInvoiceDetail } from '../entity/purchase_invoice_detail.entity';

@Injectable()
export class PurchaseInvoiceDetailRepository extends Repository<PurchaseInvoiceDetail> {
  constructor(private dataSource: DataSource) {
    super(PurchaseInvoiceDetail, dataSource.createEntityManager());
  }
}
