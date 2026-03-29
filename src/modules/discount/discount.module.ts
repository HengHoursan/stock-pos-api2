import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Discount } from './entity/discount.entity';
import { DiscountController } from './controller/discount.controller';
import { DiscountService } from './service/discount.service';
import { DiscountRepository } from './repository/discount.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Discount])],
  controllers: [DiscountController],
  providers: [DiscountService, DiscountRepository],
  exports: [DiscountService, DiscountRepository],
})
export class DiscountModule {}
