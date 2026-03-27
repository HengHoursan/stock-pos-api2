import { SoftDeleteEntity } from '@/common/entity/base.entity';
import { Column, Entity } from 'typeorm';

@Entity('currencies')
export class Currency extends SoftDeleteEntity {
  @Column({ unique: true, length: 10 })
  code: string;

  @Column({ length: 100 })
  country: string;

  @Column({ length: 100 })
  currency: string;

  @Column({ length: 10, nullable: true })
  symbol: string;

  @Column({ name: 'thousand_separator', length: 5, default: ',' })
  thousandSeparator: string;

  @Column({ name: 'decimal_separator', length: 5, default: '.' })
  decimalSeparator: string;

  @Column({ default: true })
  status: boolean;
}
