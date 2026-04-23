import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { SoftDeleteEntity } from '../../../common/entity/base.entity';
import { PurchaseQuotation } from './purchase_quotation.entity';
import { Product } from '../../product/entity/product.entity';

@Entity('purchase_quotation_details')
export class PurchaseQuotationDetail extends SoftDeleteEntity {
  @Column({ name: 'purchase_quotation_id' })
  purchaseQuotationId: number;

  @Column({ name: 'product_id' })
  productId: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  quantity: number;

  @Column({ name: 'total_price', type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalPrice: number;

  @ManyToOne(() => PurchaseQuotation, (pq) => pq.details)
  @JoinColumn({ name: 'purchase_quotation_id' })
  purchaseQuotation: PurchaseQuotation;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;
}
