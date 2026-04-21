/**
 * Represents a multi-locale translation object
 * where keys are locale codes (e.g., 'en', 'uk', 'pl')
 * and values are the translated strings
 */
export type Translation = Record<string, string>;

/**
 * Helper type for nullable translations
 */
export type TranslationOrNull = Translation | null;
