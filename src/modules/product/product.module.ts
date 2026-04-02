import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entity/product.entity';
import { ProductDetail } from './entity/product_detail.entity';
import { ProductController } from './controller/product.controller';
import { ProductService } from './service/product.service';
import { ProductRepository } from './repository/product.repository';
import { ProductDetailRepository } from './repository/product-detail.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Product, ProductDetail])],
  controllers: [ProductController],
  providers: [ProductService, ProductRepository, ProductDetailRepository],
  exports: [ProductService, ProductRepository, ProductDetailRepository],
})
export class ProductModule {}
