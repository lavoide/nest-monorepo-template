import { HttpStatus } from '@nestjs/common';
import { AbstractReportableException } from './abstract-reportable.exception';

// Example of a custom business exception that extends the abstract reportable exception
export class UserNotActivatedException extends AbstractReportableException {
  constructor(userId: number) {
    super(`User ${userId} is not activated`, HttpStatus.FORBIDDEN);
  }

  getApiErrorCode(): string {
    return 'USER_NOT_ACTIVATED';
  }
}

export class InsufficientBalanceException extends AbstractReportableException {
  constructor(required: number, available: number) {
    super(
      `Insufficient balance. Required: ${required}, Available: ${available}`,
      HttpStatus.PAYMENT_REQUIRED,
    );
  }

  getApiErrorCode(): string {
    return 'INSUFFICIENT_BALANCE';
  }
}

export class DuplicateResourceException extends AbstractReportableException {
  constructor(resource: string, field: string, value: string) {
    super(
      `${resource} with ${field} '${value}' already exists`,
      HttpStatus.CONFLICT,
    );
  }

  getApiErrorCode(): string {
    return 'DUPLICATE_RESOURCE';
  }
}