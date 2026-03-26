import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity, SoftDeleteEntity } from '../../../common/entity/base.entity';
import { Role } from '../../role/entity/role.entity';

@Entity('users')
export class User extends SoftDeleteEntity {
  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column({ unique: true })
  email: string;

  @ManyToOne(() => Role, (role) => role.users, { eager: true })
  @JoinColumn({ name: 'role_id' })
  role: Role;
}
