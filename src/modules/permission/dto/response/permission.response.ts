import { Expose, Exclude } from 'class-transformer';

@Exclude()
export class PermissionResponse {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  displayName: string;

  @Expose()
  group?: string;

  @Expose()
  sort: number;
}
