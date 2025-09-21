import { HttpException, HttpStatus } from '@nestjs/common';

export abstract class AbstractReportableException extends HttpException {
  constructor(message: string, statusCode: HttpStatus) {
    super(message, statusCode);
  }

  abstract getApiErrorCode(): string;
}
