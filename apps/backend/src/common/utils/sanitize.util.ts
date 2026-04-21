/**
 * Generic utility to strip specified fields from an object
 * Use this to remove sensitive data before returning to clients
 */
export function stripFields<
  T extends Record<string, unknown>,
  K extends string,
>(obj: T, fields: readonly K[]): Omit<T, K> {
  const result = { ...obj } as Record<string, unknown>;
  for (const field of fields) {
    delete result[field];
  }
  return result as Omit<T, K>;
}

/**
 * Strips specified fields from an array of objects
 */
export function stripFieldsArray<
  T extends Record<string, unknown>,
  K extends string,
>(arr: T[], fields: readonly K[]): Omit<T, K>[] {
  return arr.map((obj) => stripFields(obj, fields));
}

// ============================================================================
// User-specific utilities
// ============================================================================

export const SENSITIVE_USER_FIELDS = ['password', 'refreshToken'] as const;

/**
 * Strips sensitive fields (password, refreshToken) from a user object
 */
export function stripSensitiveUserFields<T extends Record<string, unknown>>(
  user: T,
): Omit<T, 'password' | 'refreshToken'> {
  return stripFields(user, SENSITIVE_USER_FIELDS);
}

/**
 * Strips sensitive fields from an array of users
 */
export function stripSensitiveUserFieldsArray<
  T extends Record<string, unknown>,
>(users: T[]): Omit<T, 'password' | 'refreshToken'>[] {
  return stripFieldsArray(users, SENSITIVE_USER_FIELDS);
}
