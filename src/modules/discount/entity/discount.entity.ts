import { Entity, Column } from 'typeorm';
import { SoftDeleteEntity } from '../../../common/entity/base.entity';

@Entity('discounts')
export class Discount extends SoftDeleteEntity {
  @Column({ unique: true, length: 50 })
  code: string;

  @Column({ name: 'discount_type', length: 50 })
  discountType: string;

  @Column({ name: 'discount_amount', type: 'decimal', precision: 12, scale: 2 })
  discountAmount: number;

  @Column({ name: 'discount_start_date', type: 'timestamp' })
  discountStartDate: Date;

  @Column({ name: 'discount_end_date', type: 'timestamp' })
  discountEndDate: Date;
}
