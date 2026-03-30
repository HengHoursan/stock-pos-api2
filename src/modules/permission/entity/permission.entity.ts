import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity, SoftDeleteEntity } from '../../../common/entity/base.entity';
import { RolePermission } from '../../role_permission/entity/role_permission.entity';

@Entity('permissions')
export class Permission extends SoftDeleteEntity {
  @Column({ unique: true })
  name: string;

  @Column({ name: 'display_name' })
  displayName: string;

  @Column({ name: 'group', nullable: true })
  group: string;

  @Column({ nullable: true })
  sort: number;

  @OneToMany(() => RolePermission, (rp) => rp.permission)
  rolePermissions: RolePermission[];

  @Column({ default: true })
  status: boolean;
}
