import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { SoftDeleteEntity } from '../../../common/entity/base.entity';
import { PurchasePayment } from './purchase_payment.entity';
import { PurchaseInvoice } from '../../purchase_invoice/entity/purchase_invoice.entity';
import { PurchaseInvoiceDetail } from '../../purchase_invoice/entity/purchase_invoice_detail.entity';

@Entity('purchase_payment_details')
export class PurchasePaymentDetail extends SoftDeleteEntity {
  @Column({ name: 'purchase_payment_id' })
  purchasePaymentId: number;

  @Column({ name: 'total_price', type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalPrice: number;

  @Column({ name: 'purchase_invoice_id', nullable: true })
  purchaseInvoiceId: number | null;

  @Column({ name: 'purchase_invoice_detail_id', nullable: true })
  purchaseInvoiceDetailId: number | null;

  @ManyToOne(() => PurchasePayment, (pp) => pp.details)
  @JoinColumn({ name: 'purchase_payment_id' })
  purchasePayment: PurchasePayment;

  @ManyToOne(() => PurchaseInvoice, { nullable: true })
  @JoinColumn({ name: 'purchase_invoice_id' })
  purchaseInvoice: PurchaseInvoice;

  @ManyToOne(() => PurchaseInvoiceDetail, { nullable: true })
  @JoinColumn({ name: 'purchase_invoice_detail_id' })
  purchaseInvoiceDetail: PurchaseInvoiceDetail;
}
