import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { SoftDeleteEntity } from '../../../common/entity/base.entity';
import { InvoiceStatus } from '../../../common/enum/invoice_status.enum';
import { Supplier } from '../../supplier/entity/supplier.entity';
import { PurchaseReturnDetail } from './purchase_return_detail.entity';
import { PurchaseInvoice } from '@/purchase_invoice/entity/purchase_invoice.entity';

@Entity('purchase_returns')
export class PurchaseReturn extends SoftDeleteEntity {
  @Column({ unique: true, length: 50 })
  code: string;

  @Column({ name: 'supplier_id' })
  supplierId: number;

  @Column({ name: 'total_line', type: 'int', default: 0 })
  totalLine: number;

  @Column({
    name: 'total_price',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  totalPrice: number;

  @Column({
    type: 'int',
    default: InvoiceStatus.DRAFT,
  })
  status: InvoiceStatus;

  @Column({ name: 'return_date', type: 'timestamp' })
  returnDate: Date;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'is_cancel', default: false })
  isCancel: boolean;

  @ManyToOne(() => Supplier)
  @JoinColumn({ name: 'supplier_id' })
  supplier: Supplier;

  @Column({ name: 'purchase_invoice_id', nullable: true })
  purchaseInvoiceId: number;

  @ManyToOne(() => PurchaseInvoice)
  @JoinColumn({ name: 'purchase_invoice_id' })
  purchaseInvoice: PurchaseInvoice;

  @OneToMany(() => PurchaseReturnDetail, (detail) => detail.purchaseReturn, {
    cascade: true,
  })
  details: PurchaseReturnDetail[];
}
