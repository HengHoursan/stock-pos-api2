import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entity/base.entity';
import { PurchaseReturn } from './purchase_return.entity';
import { Product } from '../../product/entity/product.entity';
import { PurchaseInvoice } from '../../purchase_invoice/entity/purchase_invoice.entity';
import { PurchaseInvoiceDetail } from '../../purchase_invoice/entity/purchase_invoice_detail.entity';

@Entity('purchase_return_details')
export class PurchaseReturnDetail extends BaseEntity {
  @Column({ name: 'purchase_return_id' })
  purchaseReturnId: number;

  @Column({ name: 'product_id' })
  productId: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  quantity: number;

  @Column({ name: 'total_price', type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalPrice: number;

  @Column({ name: 'purchase_invoice_id', nullable: true })
  purchaseInvoiceId: number | null;

  @Column({ name: 'purchase_invoice_detail_id', nullable: true })
  purchaseInvoiceDetailId: number | null;

  @ManyToOne(() => PurchaseReturn, (pr) => pr.details)
  @JoinColumn({ name: 'purchase_return_id' })
  purchaseReturn: PurchaseReturn;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ManyToOne(() => PurchaseInvoice, { nullable: true })
  @JoinColumn({ name: 'purchase_invoice_id' })
  purchaseInvoice: PurchaseInvoice;

  @ManyToOne(() => PurchaseInvoiceDetail, { nullable: true })
  @JoinColumn({ name: 'purchase_invoice_detail_id' })
  purchaseInvoiceDetail: PurchaseInvoiceDetail;
}
