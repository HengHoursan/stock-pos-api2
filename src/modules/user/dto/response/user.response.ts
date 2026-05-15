import { RoleResponse } from '@/role/dto';
import { Expose, Exclude, Type, Transform } from 'class-transformer';

@Exclude()
export class UserResponse {
  @Expose()
  id: number;

  @Expose()
  username: string;

  @Expose()
  email: string;

  @Expose()
  @Type(() => RoleResponse)
  role: RoleResponse;

  @Expose()
  status: boolean;

  @Expose()
  photo: string;

  @Expose()
  must_change_password: boolean;

  @Expose()
  permissions: string[];
}
