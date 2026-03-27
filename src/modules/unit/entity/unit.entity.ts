import { SoftDeleteEntity } from '@/common/entity/base.entity';
import { Column, Entity } from 'typeorm';

@Entity('units')
export class Unit extends SoftDeleteEntity {
  @Column({ unique: true, length: 50 })
  code: string;

  @Column({ name: 'parent_id', nullable: true })
  parentId: number;

  @Column({ unique: true, length: 100 })
  name: string;

  @Column({ unique: true, length: 100 })
  slug: string;

  @Column({ length: 50, nullable: true })
  symbol: string;

  @Column({
    name: 'conversion_factor',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  conversionFactor: number;

  @Column({
    name: 'default_price',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  defaultPrice: number;

  @Column({
    name: 'is_calculate_detail',
    type: 'boolean',
    default: false,
  })
  isCalculateDetail: boolean;

  @Column({ default: true })
  status: boolean;
}
