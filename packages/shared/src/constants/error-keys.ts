/**
 * Backend error i18n keys — compile-time safe references.
 * Values match keys in packages/shared/locales/{en,uk}.json under the "errors" namespace.
 *
 * Usage:
 *   throw new HttpException(ERROR_KEYS.AUTH.WRONG_CREDS, HttpStatus.UNAUTHORIZED);
 *
 * When adding a new error:
 *   1. Add the key here
 *   2. Add matching entries in en.json + uk.json under the "errors" namespace
 */
export const ERROR_KEYS = {
  AUTH: {
    SOMETHING_WRONG: 'errors.auth.somethingWrong',
    WRONG_CREDS: 'errors.auth.wrongCreds',
    INVALID_TOKEN: 'errors.auth.invalidToken',
    CANT_DELETE: 'errors.auth.cantDelete',
    CANT_EDIT: 'errors.auth.cantEdit',
    WRONG_GOOGLE_TOKEN: 'errors.auth.wrongGoogleToken',
  },
  USER: {
    NOT_FOUND: 'errors.user.notFound',
  },
  ENTITY: {
    NOT_FOUND: 'errors.entity.notFound',
    WRONG_PAGE: 'errors.entity.wrongPage',
    WRONG_PARAM: 'errors.entity.wrongParam',
    WRONG_ORDER: 'errors.entity.wrongOrder',
  },
  FILE: {
    NOT_FOUND: 'errors.file.notFound',
    ERROR_DELETING: 'errors.file.errorDeleting',
  },
} as const;
