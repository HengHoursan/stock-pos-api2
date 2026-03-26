import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Brand } from './entity/brand.entity';
import { BrandController } from './controller/brand.controller';
import { BrandService } from './service/brand.service';
import { BrandRepository } from './repository/brand.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Brand])],
  controllers: [BrandController],
  providers: [BrandService, BrandRepository],
  exports: [BrandService, BrandRepository],
})
export class BrandModule {}
