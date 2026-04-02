import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entity/base.entity';
import { Product } from './product.entity';

@Entity('product_details')
export class ProductDetail extends BaseEntity {
  @Column({ name: 'product_id', unique: true })
  productId: number;

  @Column({ name: 'current_stock', type: 'decimal', precision: 12, scale: 2, default: 0 })
  currentStock: number;

  @Column({ name: 'stock_number', nullable: true })
  stockNumber: string;

  @Column({ name: 'purchase_price', type: 'decimal', precision: 12, scale: 2, default: 0 })
  purchasePrice: number;

  @Column({ name: 'sale_price', type: 'decimal', precision: 12, scale: 2, default: 0 })
  salePrice: number;

  @Column({ name: 'expiry_date', type: 'timestamp', nullable: true })
  expiryDate: Date | null;

  @Column({ name: 'expiry_type', nullable: true })
  expiryType: string;

  @OneToOne(() => Product, (product) => product.detail)
  @JoinColumn({ name: 'product_id' })
  product: Product;
}
