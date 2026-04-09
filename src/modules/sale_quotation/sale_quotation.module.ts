import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SaleQuotation } from './entity/sale_quotation.entity';
import { SaleQuotationDetail } from './entity/sale_quotation_detail.entity';
import { SaleQuotationRepository } from './repository/sale_quotation.repository';
import { SaleQuotationService } from './service/sale_quotation.service';
import { SaleQuotationController } from './controller/sale_quotation.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SaleQuotation, SaleQuotationDetail])],
  controllers: [SaleQuotationController],
  providers: [SaleQuotationRepository, SaleQuotationService],
  exports: [SaleQuotationService, SaleQuotationRepository],
})
export class SaleQuotationModule {}
