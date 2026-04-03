import { Expose } from 'class-transformer';
import { CustomerType } from '../../../../common/enum/customer_type.enum';

export class SupplierResponse {
  @Expose()
  id: number;

  @Expose()
  code: string;

  @Expose()
  name: string;

  @Expose()
  nameLatin: string;

  @Expose()
  email: string;

  @Expose()
  phoneNumber: string;

  @Expose()
  address: string;

  @Expose()
  description: string;

  @Expose()
  type: CustomerType;

  @Expose()
  status: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
