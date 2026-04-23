import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PurchasePayment } from './entity/purchase_payment.entity';
import { PurchasePaymentDetail } from './entity/purchase_payment_detail.entity';
import { PurchasePaymentRepository } from './repository/purchase_payment.repository';
import { PurchasePaymentService } from './service/purchase_payment.service';
import { PurchasePaymentController } from './controller/purchase_payment.controller';

import { PurchaseOrderModule } from '../purchase_order/purchase_order.module';
import { PurchaseInvoiceModule } from '../purchase_invoice/purchase_invoice.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PurchasePayment, PurchasePaymentDetail]),
    PurchaseOrderModule,
    PurchaseInvoiceModule
  ],
  controllers: [PurchasePaymentController],
  providers: [PurchasePaymentRepository, PurchasePaymentService],
  exports: [PurchasePaymentService, PurchasePaymentRepository],
})
export class PurchasePaymentModule {}
