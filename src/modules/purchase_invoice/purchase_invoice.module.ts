import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PurchaseInvoice } from './entity/purchase_invoice.entity';
import { PurchaseInvoiceDetail } from './entity/purchase_invoice_detail.entity';
import { PurchaseInvoiceRepository } from './repository/purchase_invoice.repository';
import { PurchaseInvoiceDetailRepository } from './repository/purchase_invoice_detail.repository';
import { PurchaseInvoiceService } from './service/purchase_invoice.service';
import { PurchaseInvoiceController } from './controller/purchase_invoice.controller';
import { ProductModule } from '../product/product.module';
import { PurchaseOrderModule } from '../purchase_order/purchase_order.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PurchaseInvoice, PurchaseInvoiceDetail]),
    ProductModule,
    PurchaseOrderModule,
  ],
  controllers: [PurchaseInvoiceController],
  providers: [
    PurchaseInvoiceService,
    PurchaseInvoiceRepository,
    PurchaseInvoiceDetailRepository,
  ],
  exports: [
    PurchaseInvoiceService,
    PurchaseInvoiceRepository,
    PurchaseInvoiceDetailRepository,
  ],
})
export class PurchaseInvoiceModule {}
