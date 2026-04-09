import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entity/base.entity';
import { Product } from '../../product/entity/product.entity';
import { SaleQuotation } from './sale_quotation.entity';

@Entity('sale_quotation_details')
export class SaleQuotationDetail extends BaseEntity {
  @Column({ name: 'sale_quotation_id' })
  saleQuotationId: number;

  @Column({ name: 'product_id' })
  productId: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  quantity: number;

  @Column({ name: 'unit_price', type: 'decimal', precision: 12, scale: 2 })
  unitPrice: number;

  @Column({ name: 'total_price', type: 'decimal', precision: 12, scale: 2 })
  totalPrice: number;

  @ManyToOne(() => SaleQuotation, (quotation) => quotation.details, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sale_quotation_id' })
  saleQuotation: SaleQuotation;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;
}
