import { Expose, Exclude } from 'class-transformer';

@Exclude()
export class RoleResponse {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  displayName?: string;
}
