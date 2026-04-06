import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { SaleInvoiceDetail } from '../entity/sale_invoice_detail.entity';

@Injectable()
export class SaleInvoiceDetailRepository extends Repository<SaleInvoiceDetail> {
  constructor(private dataSource: DataSource) {
    super(SaleInvoiceDetail, dataSource.createEntityManager());
  }
}
