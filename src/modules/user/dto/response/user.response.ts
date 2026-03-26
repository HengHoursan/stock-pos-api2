import { RoleResponse } from '@/role/dto';
import { Expose, Exclude, Type } from 'class-transformer';

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
}
