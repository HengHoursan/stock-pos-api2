import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { SoftDeleteEntity } from '../../../common/entity/base.entity';
import { SaleOrder } from './sale_order.entity';
import { Product } from '../../product/entity/product.entity';
import { PurchaseQuotation } from '../../purchase_quotation/entity/purchase_quotation.entity';
import { PurchaseQuotationDetail } from '../../purchase_quotation/entity/purchase_quotation_detail.entity';

@Entity('sale_order_details')
export class SaleOrderDetail extends SoftDeleteEntity {
  @Column({ name: 'sale_order_id' })
  saleOrderId: number;

  @Column({ name: 'product_id' })
  productId: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  quantity: number;

  @Column({ name: 'total_price', type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalPrice: number;

  @Column({ name: 'purchase_quotation_id', nullable: true })
  purchaseQuotationId: number | null;

  @Column({ name: 'purchase_quotation_detail_id', nullable: true })
  purchaseQuotationDetailId: number | null;

  @ManyToOne(() => SaleOrder, (so) => so.details)
  @JoinColumn({ name: 'sale_order_id' })
  saleOrder: SaleOrder;

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
