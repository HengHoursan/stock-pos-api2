import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: exception.message || null,
      stack: exception.stack || null,
    };

    // Write error to file
    const logPath = path.join(process.cwd(), 'error.log');
    fs.appendFileSync(logPath, JSON.stringify(errorResponse, null, 2) + '\n');

    // Print error to terminal
    this.logger.error(
      `${request.method} ${request.url} - Status: ${status} - Message: ${errorResponse.message}`,
      exception.stack,
    );

    response.status(status).json(errorResponse);
  }
}
