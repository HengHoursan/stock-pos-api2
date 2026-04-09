import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PurchaseReturn } from './entity/purchase_return.entity';
import { PurchaseReturnDetail } from './entity/purchase_return_detail.entity';
import { PurchaseReturnRepository } from './repository/purchase_return.repository';
import { PurchaseReturnService } from './service/purchase_return.service';
import { PurchaseReturnController } from './controller/purchase_return.controller';
import { ProductModule } from '../product/product.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PurchaseReturn, PurchaseReturnDetail]),
    ProductModule,
  ],
  controllers: [PurchaseReturnController],
  providers: [PurchaseReturnRepository, PurchaseReturnService],
  exports: [PurchaseReturnService, PurchaseReturnRepository],
})
export class PurchaseReturnModule {}
