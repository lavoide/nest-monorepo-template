/**
 * Extract localized string from a multilingual JSON object.
 * Backend stores multilingual fields as JSON: { en: "English", uk: "Українська" }
 */
export function getLocalizedValue(
  value: string | Record<string, string> | null | undefined,
  currentLocale: string,
  fallbackLocale = 'en',
): string {
  if (typeof value === 'string') {
    return value;
  }

  if (!value) {
    return '';
  }

  if (typeof value === 'object') {
    if (value[currentLocale]) {
      return value[currentLocale];
    }

    if (value[fallbackLocale]) {
      return value[fallbackLocale];
    }

    const firstValue = Object.values(value)[0];
    return firstValue || '';
  }

  return '';
}
