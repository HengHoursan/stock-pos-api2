import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { SoftDeleteEntity } from '../../../common/entity/base.entity';
import { OrderStatus } from '../../../common/enum/order_status.enum';
import { Supplier } from '../../supplier/entity/supplier.entity';
import { PurchaseOrderDetail } from './purchase_order_detail.entity';

@Entity('purchase_orders')
export class PurchaseOrder extends SoftDeleteEntity {
  @Column({ unique: true, length: 50 })
  code: string;

  @Column({ name: 'supplier_id' })
  supplierId: number;

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

  @ManyToOne(() => Supplier)
  @JoinColumn({ name: 'supplier_id' })
  supplier: Supplier;

  @OneToMany(() => PurchaseOrderDetail, (detail) => detail.purchaseOrder, {
    cascade: true,
  })
  details: PurchaseOrderDetail[];
}
