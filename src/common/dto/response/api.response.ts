import { HttpStatus } from '@nestjs/common';

export class ApiResponse<T> {
  success: boolean;
  status: number;
  message: string;
  data: T | null;

  constructor(
    success: boolean,
    status: number,
    message: string,
    data: T | null = null,
  ) {
    this.success = success;
    this.status = status;
    this.message = message;
    this.data = data;
  }

  static success<T>(
    data: T,
    message = 'Success',
    status = HttpStatus.OK,
  ): ApiResponse<T> {
    return new ApiResponse<T>(true, status, message, data);
  }

  static error(
    message = 'Something went wrong',
    status = HttpStatus.INTERNAL_SERVER_ERROR,
  ): ApiResponse<null> {
    return new ApiResponse<null>(false, status, message, null);
  }
}
