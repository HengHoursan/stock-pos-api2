import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Currency } from './entity/currency.entity';
import { CurrencyRepository } from './repository/currency.repository';
import { CurrencyService } from './service/currency.service';
import { CurrencyController } from './controller/currency.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Currency])],
  providers: [CurrencyRepository, CurrencyService],
  controllers: [CurrencyController],
  exports: [CurrencyService],
})
export class CurrencyModule {}
