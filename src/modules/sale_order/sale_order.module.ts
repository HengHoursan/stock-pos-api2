import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SaleOrder } from './entity/sale_order.entity';
import { SaleOrderDetail } from './entity/sale_order_detail.entity';
import { SaleOrderRepository } from './repository/sale_order.repository';
import { SaleOrderDetailRepository } from './repository/sale_order_detail.repository';
import { SaleOrderService } from './service/sale_order.service';
import { SaleOrderController } from './controller/sale_order.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SaleOrder, SaleOrderDetail])],
  controllers: [SaleOrderController],
  providers: [
    SaleOrderService,
    SaleOrderRepository,
    SaleOrderDetailRepository,
  ],
  exports: [SaleOrderService, SaleOrderRepository, SaleOrderDetailRepository],
})
export class SaleOrderModule {}
