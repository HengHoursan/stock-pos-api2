import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Supplier } from './entity/supplier.entity';
import { SupplierRepository } from './repository/supplier.repository';
import { SupplierService } from './service/supplier.service';
import { SupplierController } from './controller/supplier.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Supplier])],
  controllers: [SupplierController],
  providers: [SupplierRepository, SupplierService],
  exports: [SupplierService],
})
export class SupplierModule {}
