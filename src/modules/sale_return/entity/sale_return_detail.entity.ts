import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entity/base.entity';
import { Product } from '../../product/entity/product.entity';
import { SaleReturn } from './sale_return.entity';

@Entity('sale_return_details')
export class SaleReturnDetail extends BaseEntity {
  @Column({ name: 'sale_return_id' })
  saleReturnId: number;

  @Column({ name: 'product_id' })
  productId: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  quantity: number;

  @Column({ name: 'unit_price', type: 'decimal', precision: 12, scale: 2 })
  unitPrice: number;

  @Column({ name: 'total_price', type: 'decimal', precision: 12, scale: 2 })
  totalPrice: number;

  @ManyToOne(() => SaleReturn, (saleReturn) => saleReturn.details, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'sale_return_id' })
  saleReturn: SaleReturn;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;
}
