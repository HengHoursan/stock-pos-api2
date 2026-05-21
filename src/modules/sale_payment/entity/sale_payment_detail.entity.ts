import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { SoftDeleteEntity } from '../../../common/entity/base.entity';
import { SaleInvoice } from '../../sale_invoice/entity/sale_invoice.entity';
import { SalePayment } from './sale_payment.entity';

@Entity('sale_payment_details')
export class SalePaymentDetail extends SoftDeleteEntity {
  @Column({ name: 'sale_payment_id' })
  salePaymentId: number;

  @Column({ name: 'sale_invoice_id' })
  saleInvoiceId: number;

  @Column({ name: 'paid_amount', type: 'decimal', precision: 12, scale: 2 })
  paidAmount: number;

  @ManyToOne(() => SalePayment, (payment) => payment.details, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'sale_payment_id' })
  salePayment: SalePayment;

  @ManyToOne(() => SaleInvoice)
  @JoinColumn({ name: 'sale_invoice_id' })
  saleInvoice: SaleInvoice;
}
