import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportController } from '@/report/controller/report.controller';
import { ReportService } from '@/report/service/report.service';
import { ReportRepository } from '@/report/repository/report.repository';

import { Customer } from '@/customer/entity/customer.entity';
import { Supplier } from '@/supplier/entity/supplier.entity';
import { Product } from '@/product/entity/product.entity';
import { SalePayment } from '@/sale_payment/entity/sale_payment.entity';
import { SaleReturn } from '@/sale_return/entity/sale_return.entity';
import { PurchasePayment } from '@/purchase_payment/entity/purchase_payment.entity';
import { PurchaseReturn } from '@/purchase_return/entity/purchase_return.entity';
import { Transaction } from '@/transaction/entity/transaction.entity';
import { SaleInvoice } from '@/sale_invoice/entity/sale_invoice.entity';
import { PurchaseInvoice } from '@/purchase_invoice/entity/purchase_invoice.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Customer,
      Supplier,
      Product,
      SalePayment,
      SaleReturn,
      PurchasePayment,
      PurchaseReturn,
      Transaction,
      SaleInvoice,
      PurchaseInvoice,
    ]),
  ],
  controllers: [ReportController],
  providers: [ReportService, ReportRepository],
})
export class ReportModule {}
