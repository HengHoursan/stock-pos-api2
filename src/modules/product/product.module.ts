import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entity/product.entity';
import { ProductDetail } from './entity/product_detail.entity';
import { ProductController } from './controller/product.controller';
import { ProductService } from './service/product.service';
import { StockService } from './service/stock.service';
import { ProductRepository } from './repository/product.repository';
import { ProductDetailRepository } from './repository/product-detail.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Product, ProductDetail])],
  controllers: [ProductController],
  providers: [
    ProductService,
    StockService,
    ProductRepository,
    ProductDetailRepository,
  ],
  exports: [
    ProductService,
    StockService,
    ProductRepository,
    ProductDetailRepository,
  ],
})
export class ProductModule {}
