export class PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  sortBy: string;
  sortOrder: string;

  constructor(
    page: number,
    limit: number,
    totalItems: number,
    sortBy: string = 'id',
    sortOrder: string = 'DESC',
  ) {
    this.page = page;
    this.limit = limit;
    this.totalItems = totalItems;
    this.totalPages = limit > 0 ? Math.ceil(totalItems / limit) : 0;
    this.sortBy = sortBy;
    this.sortOrder = sortOrder;
  }
}

export class PaginationResponse<T> {
  data: T[];
  meta: PaginationMeta;

  constructor(data: T[], meta: PaginationMeta) {
    this.data = data;
    this.meta = meta;
  }

  static create<T>(
    data: T[],
    totalItems: number,
    page: number,
    limit: number,
    sortBy: string = 'id',
    sortOrder: string = 'DESC',
  ): PaginationResponse<T> {
    const meta = new PaginationMeta(page, limit, totalItems, sortBy, sortOrder);
    return new PaginationResponse<T>(data, meta);
  }
}
