import { BadRequestException, ValidationError } from '@nestjs/common';

export const validationExceptionFactory = (
  validationErrors: ValidationError[] = [],
) => {
  const getPrettyClassValidatorErrors = (
    validationErrors: ValidationError[],
    parentProperty = '',
  ): Array<{ property: string; errors: string[] }> => {
    const errors: Array<{ property: string; errors: string[] }> = [];

    const getValidationErrorsRecursively = (
      validationErrors: ValidationError[],
      parentProperty = '',
    ) => {
      for (const error of validationErrors) {
        const propertyPath = parentProperty
          ? `${parentProperty}.${error.property}`
          : error.property;

        if (error.constraints) {
          errors.push({
            property: propertyPath,
            errors: Object.values(error.constraints),
          });
        }

        if (error.children?.length) {
          getValidationErrorsRecursively(error.children, propertyPath);
        }
      }
    };

    getValidationErrorsRecursively(validationErrors, parentProperty);

    return errors;
  };

  const errors = getPrettyClassValidatorErrors(validationErrors);

  return new BadRequestException({
    success: false,
    message: 'Validation error',
    errors: errors,
    timestamp: new Date().toISOString(),
  });
};