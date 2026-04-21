import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import type { ApiOkResponseDto } from './dto/api-ok-response.dto';
import type { ApiResponseDto } from './dto/api-response.dto';

@Injectable()
export class BaseController {
  protected respondSuccess<T>(
    data: T = null as T,
    message = 'Success',
  ): ApiResponseDto<T> {
    return {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  protected respondOk(message = 'Success'): ApiOkResponseDto {
    return {
      success: true,
      message,
      timestamp: new Date().toISOString(),
    };
  }

  protected respondError(
    message = 'Error',
    code: number = HttpStatus.BAD_REQUEST,
  ): never {
    throw new HttpException(
      {
        success: false,
        message,
        timestamp: new Date().toISOString(),
      },
      code,
    );
  }

  protected respondNotFound(message = 'Not Found'): never {
    return this.respondError(message, HttpStatus.NOT_FOUND);
  }

  protected respondUnauthorized(message = 'Unauthorized'): never {
    return this.respondError(message, HttpStatus.UNAUTHORIZED);
  }

  protected respondForbidden(message = 'Forbidden'): never {
    return this.respondError(message, HttpStatus.FORBIDDEN);
  }

  protected respondCreated<T>(data: T = null as T): ApiResponseDto<T> {
    return this.respondSuccess(data, 'Created');
  }

  protected respondValidationError(message = 'Validation Error'): never {
    return this.respondError(message, HttpStatus.UNPROCESSABLE_ENTITY);
  }

  protected sendNoContent(): null {
    return null;
  }
}
