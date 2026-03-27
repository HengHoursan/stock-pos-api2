import { Expose } from 'class-transformer';

export class CurrencyResponse {
  @Expose()
  id: number;

  @Expose()
  code: string;

  @Expose()
  country: string;

  @Expose()
  currency: string;

  @Expose()
  symbol: string;

  @Expose({ name: 'thousand_separator' })
  thousandSeparator: string;

  @Expose({ name: 'decimal_separator' })
  decimalSeparator: string;

  @Expose()
  status: boolean;
}
