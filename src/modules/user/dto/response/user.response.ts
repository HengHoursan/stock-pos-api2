import { Expose, Exclude } from 'class-transformer';

@Exclude()
export class UserResponse {
  @Expose()
  id: number;

  @Expose()
  username: string;

  @Expose()
  email: string;

  @Expose()
  roleId?: number;
}
