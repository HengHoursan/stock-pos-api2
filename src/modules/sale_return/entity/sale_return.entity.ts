import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { SoftDeleteEntity } from '../../../common/entity/base.entity';
import { InvoiceStatus } from '../../../common/enum/invoice_status.enum';
import { Customer } from '../../customer/entity/customer.entity';
import { SaleReturnDetail } from './sale_return_detail.entity';

@Entity('sale_returns')
export class SaleReturn extends SoftDeleteEntity {
  @Column({ unique: true, length: 50 })
  code: string;

  @Column({ name: 'customer_id' })
  customerId: number;

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

  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @OneToMany(() => SaleReturnDetail, (detail) => detail.saleReturn, {
    cascade: true,
  })
  details: SaleReturnDetail[];
}
