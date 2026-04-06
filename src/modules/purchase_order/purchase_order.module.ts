import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PurchaseOrder } from './entity/purchase_order.entity';
import { PurchaseOrderDetail } from './entity/purchase_order_detail.entity';
import { PurchaseOrderRepository } from './repository/purchase_order.repository';
import { PurchaseOrderDetailRepository } from './repository/purchase_order_detail.repository';
import { PurchaseOrderService } from './service/purchase_order.service';
import { PurchaseOrderController } from './controller/purchase_order.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PurchaseOrder, PurchaseOrderDetail])],
  controllers: [PurchaseOrderController],
  providers: [
    PurchaseOrderService,
    PurchaseOrderRepository,
    PurchaseOrderDetailRepository,
  ],
  exports: [PurchaseOrderService, PurchaseOrderRepository, PurchaseOrderDetailRepository],
})
export class PurchaseOrderModule {}
