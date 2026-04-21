import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import '../i18n/config';

interface I18nContextValue {
  currentLanguage: string;
  availableLanguages: string[];
  changeLanguage: (lang: string) => Promise<void>;
}

interface I18nProviderProps {
  children: ReactNode;
  availableLocales?: string[];
  defaultLocale?: string;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = 'preferred-language';
const DEFAULT_LANGUAGES = ['en', 'uk'];

export function I18nProvider({
  children,
  availableLocales,
  defaultLocale,
}: I18nProviderProps) {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);

  const availableLanguages = availableLocales || DEFAULT_LANGUAGES;

  useEffect(() => {
    const handleLanguageChanged = (lang: string) => {
      setCurrentLanguage(lang);
    };

    i18n.on('languageChanged', handleLanguageChanged);
    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, [i18n]);

  useEffect(() => {
    const storedLang = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    const defaultLang = defaultLocale || 'en';

    let langToUse = defaultLang;

    if (storedLang && availableLanguages.includes(storedLang)) {
      langToUse = storedLang;
    } else if (!availableLanguages.includes(defaultLang)) {
      langToUse = availableLanguages[0] || 'en';
    }

    if (i18n.language !== langToUse) {
      i18n.changeLanguage(langToUse);
    }
  }, [defaultLocale, availableLanguages, i18n]);

  const changeLanguage = async (lang: string) => {
    if (!availableLanguages.includes(lang)) {
      console.warn(`Language "${lang}" is not available`);
      return;
    }
    await i18n.changeLanguage(lang);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  };

  const value: I18nContextValue = {
    currentLanguage,
    availableLanguages,
    changeLanguage,
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
