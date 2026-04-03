import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { SoftDeleteEntity } from '../../../common/entity/base.entity';
import { Product } from '../../product/entity/product.entity';
import { TransactionType } from '../../../common/enum/transaction_type.enum';

@Entity('transactions')
export class Transaction extends SoftDeleteEntity {
  @Column({ name: 'transaction_code', unique: true, length: 50 })
  transactionCode: string;

  @Column({ name: 'transaction_date', type: 'timestamp' })
  transactionDate: Date;

  @Column({
    name: 'transaction_type',
    type: 'enum',
    enum: TransactionType,
    default: TransactionType.IN,
  })
  transactionType: TransactionType;

  @Column({ name: 'product_id' })
  productId: number;

  @Column({ name: 'beginning_stock', type: 'decimal', precision: 12, scale: 2, default: 0 })
  beginningStock: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  quantity: number;

  @Column({ name: 'after_stock', type: 'decimal', precision: 12, scale: 2, default: 0 })
  afterStock: number;

  @Column({ type: 'text', nullable: true })
  remarks: string;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;
}
