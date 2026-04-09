import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SaleReturn } from './entity/sale_return.entity';
import { SaleReturnDetail } from './entity/sale_return_detail.entity';
import { SaleReturnRepository } from './repository/sale_return.repository';
import { SaleReturnService } from './service/sale_return.service';
import { SaleReturnController } from './controller/sale_return.controller';
import { ProductModule } from '../product/product.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SaleReturn, SaleReturnDetail]),
    ProductModule,
  ],
  controllers: [SaleReturnController],
  providers: [SaleReturnRepository, SaleReturnService],
  exports: [SaleReturnService, SaleReturnRepository],
})
export class SaleReturnModule {}
