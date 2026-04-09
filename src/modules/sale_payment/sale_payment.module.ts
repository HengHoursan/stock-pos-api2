import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalePayment } from './entity/sale_payment.entity';
import { SalePaymentDetail } from './entity/sale_payment_detail.entity';
import { SalePaymentRepository } from './repository/sale_payment.repository';
import { SalePaymentService } from './service/sale_payment.service';
import { SalePaymentController } from './controller/sale_payment.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SalePayment, SalePaymentDetail])],
  controllers: [SalePaymentController],
  providers: [SalePaymentRepository, SalePaymentService],
  exports: [SalePaymentService, SalePaymentRepository],
})
export class SalePaymentModule {}
