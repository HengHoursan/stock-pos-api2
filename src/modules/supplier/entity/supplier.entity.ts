import { Entity, Column } from 'typeorm';
import { SoftDeleteEntity } from '../../../common/entity/base.entity';

import { CustomerType } from '../../../common/enum/customer_type.enum';

@Entity('suppliers')
export class Supplier extends SoftDeleteEntity {
  @Column({ unique: true, length: 50 })
  code: string;

  @Column({ unique: true, length: 100 })
  name: string;

  @Column({ name: 'name_latin', length: 100, nullable: true })
  nameLatin: string;

  @Column({ length: 100, nullable: true })
  email: string;

  @Column({ name: 'phone_number', length: 20, nullable: true })
  phoneNumber: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'int', default: CustomerType.DINE_IN })
  type: CustomerType;

  @Column({ default: true })
  status: boolean;
}
