import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { Catch } from '@nestjs/common';
import type { Response } from 'express';
import { AbstractReportableException } from '../common/exceptions/abstract-reportable.exception';

@Catch(AbstractReportableException)
export class ReportableExceptionFilter implements ExceptionFilter {
  catch(exception: AbstractReportableException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const errorResponse = {
      statusCode: exception.getStatus(),
      message: exception.message,
      error_code: exception.getApiErrorCode(),
      timestamp: new Date().toISOString(),
    };

    response.status(exception.getStatus()).json(errorResponse);
  }
}
