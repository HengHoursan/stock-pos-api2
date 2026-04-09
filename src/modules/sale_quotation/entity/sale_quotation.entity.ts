import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { SoftDeleteEntity } from '../../../common/entity/base.entity';
import { Customer } from '../../customer/entity/customer.entity';
import { SaleQuotationDetail } from './sale_quotation_detail.entity';

@Entity('sale_quotations')
export class SaleQuotation extends SoftDeleteEntity {
  @Column({ unique: true, length: 50 })
  code: string;

  @Column({ name: 'customer_id', nullable: true })
  customerId: number;

  @Column({ name: 'quotation_date', type: 'timestamp' })
  quotationDate: Date;

  @Column({ name: 'total_line', type: 'int', default: 0 })
  totalLine: number;

  @Column({ name: 'total_price', type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalPrice: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @OneToMany(() => SaleQuotationDetail, (detail) => detail.saleQuotation, { cascade: true })
  details: SaleQuotationDetail[];
}
