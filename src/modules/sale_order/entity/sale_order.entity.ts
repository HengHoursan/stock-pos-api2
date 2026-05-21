import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { SoftDeleteEntity } from '../../../common/entity/base.entity';
import { OrderStatus } from '../../../common/enum/order_status.enum';
import { Customer } from '../../customer/entity/customer.entity';
import { SaleOrderDetail } from './sale_order_detail.entity';

@Entity('sale_orders')
export class SaleOrder extends SoftDeleteEntity {
  @Column({ unique: true, length: 50 })
  code: string;

  @Column({ name: 'customer_id' })
  customerId: number;

  @Column({ name: 'total_line', type: 'int', default: 0 })
  totalLine: number;

  @Column({ name: 'total_close_line', type: 'int', default: 0 })
  totalCloseLine: number;

  @Column({
    name: 'total_price',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  totalPrice: number;

  @Column({
    name: 'invoiced_amount',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  invoicedAmount: number;

  @Column({
    name: 'paid_amount',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  paidAmount: number;

  @Column({
    type: 'int',
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Column({ name: 'order_date', type: 'timestamp' })
  orderDate: Date;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'is_cancel', default: false })
  isCancel: boolean;

  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @OneToMany(() => SaleOrderDetail, (detail) => detail.saleOrder, {
    cascade: true,
  })
  details: SaleOrderDetail[];
}
