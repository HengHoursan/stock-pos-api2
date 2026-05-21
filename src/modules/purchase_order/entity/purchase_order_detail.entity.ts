import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { SoftDeleteEntity } from '../../../common/entity/base.entity';
import { PurchaseOrder } from './purchase_order.entity';
import { Product } from '../../product/entity/product.entity';
import { PurchaseQuotation } from '../../purchase_quotation/entity/purchase_quotation.entity';
import { PurchaseQuotationDetail } from '../../purchase_quotation/entity/purchase_quotation_detail.entity';

@Entity('purchase_order_details')
export class PurchaseOrderDetail extends SoftDeleteEntity {
  @Column({ name: 'purchase_order_id' })
  purchaseOrderId: number;

  @Column({ name: 'product_id' })
  productId: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  quantity: number;

  @Column({
    name: 'total_price',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  totalPrice: number;

  @Column({ name: 'purchase_quotation_id', nullable: true })
  purchaseQuotationId: number | null;

  @Column({ name: 'purchase_quotation_detail_id', nullable: true })
  purchaseQuotationDetailId: number | null;

  @ManyToOne(() => PurchaseOrder, (po) => po.details)
  @JoinColumn({ name: 'purchase_order_id' })
  purchaseOrder: PurchaseOrder;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ManyToOne(() => PurchaseQuotation, { nullable: true })
  @JoinColumn({ name: 'purchase_quotation_id' })
  purchaseQuotation: PurchaseQuotation;

  @ManyToOne(() => PurchaseQuotationDetail, { nullable: true })
  @JoinColumn({ name: 'purchase_quotation_detail_id' })
  purchaseQuotationDetail: PurchaseQuotationDetail;
}
