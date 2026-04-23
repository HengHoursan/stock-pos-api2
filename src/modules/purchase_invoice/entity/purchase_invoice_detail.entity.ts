import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { SoftDeleteEntity } from '../../../common/entity/base.entity';
import { PurchaseInvoice } from './purchase_invoice.entity';
import { Product } from '../../product/entity/product.entity';
import { PurchaseOrder } from '../../purchase_order/entity/purchase_order.entity';
import { PurchaseOrderDetail } from '../../purchase_order/entity/purchase_order_detail.entity';

@Entity('purchase_invoice_details')
export class PurchaseInvoiceDetail extends SoftDeleteEntity {
  @Column({ name: 'purchase_invoice_id' })
  purchaseInvoiceId: number;

  @Column({ name: 'product_id' })
  productId: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  quantity: number;

  @Column({ name: 'total_price', type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalPrice: number;

  @Column({ name: 'purchase_order_id', nullable: true })
  purchaseOrderId: number | null;

  @Column({ name: 'purchase_order_detail_id', nullable: true })
  purchaseOrderDetailId: number | null;

  @ManyToOne(() => PurchaseInvoice, (pi) => pi.details)
  @JoinColumn({ name: 'purchase_invoice_id' })
  purchaseInvoice: PurchaseInvoice;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ManyToOne(() => PurchaseOrder, { nullable: true })
  @JoinColumn({ name: 'purchase_order_id' })
  purchaseOrder: PurchaseOrder;

  @ManyToOne(() => PurchaseOrderDetail, { nullable: true })
  @JoinColumn({ name: 'purchase_order_detail_id' })
  purchaseOrderDetail: PurchaseOrderDetail;
}
