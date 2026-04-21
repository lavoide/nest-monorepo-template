import type { AxiosError } from 'axios';
import type { TFunction } from 'i18next';

interface ApiErrorData {
  message?: string;
  params?: Record<string, unknown>;
}

export type { ApiErrorData };

/**
 * Extract a translated error message from an Axios error response.
 * Backend sends { message: 'errors.auth.wrongCreds', params?: {...} }
 * This resolves the key via the provided t() function.
 *
 * Usage:
 *   const t = useTranslation().t;
 *   toast.error(getApiErrorMessage(error, t, 'errors.auth.somethingWrong'));
 */
export function getApiErrorMessage(
  error: AxiosError<ApiErrorData>,
  t: TFunction,
  fallbackKey: string,
): string {
  const data = error.response?.data;
  const msg = data?.message;
  if (!msg) return t(fallbackKey);
  const params = data?.params;
  return params ? t(msg, params) : t(msg);
}
