import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PurchaseInvoice } from './entity/purchase_invoice.entity';
import { PurchaseInvoiceDetail } from './entity/purchase_invoice_detail.entity';
import { PurchaseInvoiceRepository } from './repository/purchase_invoice.repository';
import { PurchaseInvoiceDetailRepository } from './repository/purchase_invoice_detail.repository';
import { PurchaseInvoiceService } from './service/purchase_invoice.service';
import { PurchaseInvoiceController } from './controller/purchase_invoice.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PurchaseInvoice, PurchaseInvoiceDetail])],
  controllers: [PurchaseInvoiceController],
  providers: [
    PurchaseInvoiceService,
    PurchaseInvoiceRepository,
    PurchaseInvoiceDetailRepository,
  ],
  exports: [PurchaseInvoiceService, PurchaseInvoiceRepository, PurchaseInvoiceDetailRepository],
})
export class PurchaseInvoiceModule {}
