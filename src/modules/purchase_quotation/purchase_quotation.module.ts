import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PurchaseQuotation } from './entity/purchase_quotation.entity';
import { PurchaseQuotationDetail } from './entity/purchase_quotation_detail.entity';
import { PurchaseQuotationRepository } from './repository/purchase_quotation.repository';
import { PurchaseQuotationDetailRepository } from './repository/purchase_quotation_detail.repository';
import { PurchaseQuotationService } from './service/purchase_quotation.service';
import { PurchaseQuotationController } from './controller/purchase_quotation.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PurchaseQuotation, PurchaseQuotationDetail])],
  controllers: [PurchaseQuotationController],
  providers: [
    PurchaseQuotationService,
    PurchaseQuotationRepository,
    PurchaseQuotationDetailRepository,
  ],
  exports: [PurchaseQuotationService, PurchaseQuotationRepository, PurchaseQuotationDetailRepository],
})
export class PurchaseQuotationModule {}
