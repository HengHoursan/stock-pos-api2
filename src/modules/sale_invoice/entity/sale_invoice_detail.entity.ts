import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { SoftDeleteEntity } from '../../../common/entity/base.entity';
import { SaleInvoice } from './sale_invoice.entity';
import { Product } from '../../product/entity/product.entity';
import { SaleOrder } from '../../sale_order/entity/sale_order.entity';
import { SaleOrderDetail } from '../../sale_order/entity/sale_order_detail.entity';

@Entity('sale_invoice_details')
export class SaleInvoiceDetail extends SoftDeleteEntity {
  @Column({ name: 'sale_invoice_id' })
  saleInvoiceId: number;

  @Column({ name: 'product_id' })
  productId: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  quantity: number;

  @Column({ name: 'total_price', type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalPrice: number;

  @Column({ name: 'sale_order_id', nullable: true })
  saleOrderId: number | null;

  @Column({ name: 'sale_order_detail_id', nullable: true })
  saleOrderDetailId: number | null;

  @ManyToOne(() => SaleInvoice, (si) => si.details)
  @JoinColumn({ name: 'sale_invoice_id' })
  saleInvoice: SaleInvoice;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ManyToOne(() => SaleOrder, { nullable: true })
  @JoinColumn({ name: 'sale_order_id' })
  saleOrder: SaleOrder;

  @ManyToOne(() => SaleOrderDetail, { nullable: true })
  @JoinColumn({ name: 'sale_order_detail_id' })
  saleOrderDetail: SaleOrderDetail;
}
