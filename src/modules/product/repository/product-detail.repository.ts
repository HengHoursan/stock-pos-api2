import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ProductDetail } from '../entity/product_detail.entity';

@Injectable()
export class ProductDetailRepository extends Repository<ProductDetail> {
  constructor(private dataSource: DataSource) {
    super(ProductDetail, dataSource.createEntityManager());
  }

  async findByProductId(productId: number): Promise<ProductDetail | null> {
    return this.findOne({ where: { productId } });
  }
}
