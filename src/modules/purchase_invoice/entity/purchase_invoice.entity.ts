import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { SoftDeleteEntity } from '../../../common/entity/base.entity';
import { InvoiceStatus } from '../../../common/enum/invoice_status.enum';
import { PaymentMethod } from '../../../common/enum/payment_method.enum';
import { Supplier } from '../../supplier/entity/supplier.entity';
import { PurchaseInvoiceDetail } from './purchase_invoice_detail.entity';

@Entity('purchase_invoices')
export class PurchaseInvoice extends SoftDeleteEntity {
  @Column({ unique: true, length: 50 })
  code: string;

  @Column({ name: 'supplier_id' })
  supplierId: number;

  @Column({ name: 'total_line', type: 'int', default: 0 })
  totalLine: number;

  @Column({ name: 'total_price', type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalPrice: number;

  @Column({ name: 'paid_amount', type: 'decimal', precision: 12, scale: 2, default: 0 })
  paidAmount: number;

  @Column({
    type: 'int',
    default: InvoiceStatus.DRAFT,
  })
  status: InvoiceStatus;

  @Column({ name: 'invoice_date', type: 'timestamp' })
  invoiceDate: Date;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'is_cancel', default: false })
  isCancel: boolean;

  @Column({
    name: 'payment_method',
    type: 'int',
    default: PaymentMethod.CASH,
  })
  paymentMethod: PaymentMethod;

  @ManyToOne(() => Supplier)
  @JoinColumn({ name: 'supplier_id' })
  supplier: Supplier;

  @OneToMany(() => PurchaseInvoiceDetail, (detail) => detail.purchaseInvoice, { cascade: true })
  details: PurchaseInvoiceDetail[];
}
