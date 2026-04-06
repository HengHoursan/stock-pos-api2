import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SaleInvoice } from './entity/sale_invoice.entity';
import { SaleInvoiceDetail } from './entity/sale_invoice_detail.entity';
import { SaleInvoiceRepository } from './repository/sale_invoice.repository';
import { SaleInvoiceDetailRepository } from './repository/sale_invoice_detail.repository';
import { SaleInvoiceService } from './service/sale_invoice.service';
import { SaleInvoiceController } from './controller/sale_invoice.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SaleInvoice, SaleInvoiceDetail])],
  controllers: [SaleInvoiceController],
  providers: [
    SaleInvoiceService,
    SaleInvoiceRepository,
    SaleInvoiceDetailRepository,
  ],
  exports: [SaleInvoiceService, SaleInvoiceRepository, SaleInvoiceDetailRepository],
})
export class SaleInvoiceModule {}
