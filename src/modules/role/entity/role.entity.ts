import { Entity, Column, OneToMany } from 'typeorm';
import { SoftDeleteEntity } from '../../../common/entity/base.entity';
import { User } from '../../user/entity/user.entity';
import { RolePermission } from '../../role_permission/entity/role_permission.entity';

@Entity('roles')
export class Role extends SoftDeleteEntity {
  @Column({ unique: true })
  name: string;
  
  @Column({ name: 'display_name', nullable: true })
  displayName: string;

  @OneToMany(() => User, (user) => user.role)
  users: User[];

  @OneToMany(() => RolePermission, (rp) => rp.role)
  rolePermissions: RolePermission[];

  @Column({ default: true })
  status: boolean;
}
