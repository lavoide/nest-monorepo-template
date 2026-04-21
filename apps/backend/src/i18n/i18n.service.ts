import * as en from '@monorepo/shared/locales/en.json';
import * as uk from '@monorepo/shared/locales/uk.json';
import { Injectable, type OnModuleInit } from '@nestjs/common';
import type { i18n } from 'i18next';
import * as i18nextModule from 'i18next';

const i18next = i18nextModule.default ?? i18nextModule;

/**
 * Server-side i18n for emails, notifications, or any server-originated content
 * that needs to be rendered in a specific language.
 *
 * For API error messages, prefer sending i18n keys back to the client
 * (via ERROR_KEYS from @monorepo/shared) and translating on the frontend —
 * the backend doesn't know the user's current language context.
 */
@Injectable()
export class BackendI18nService implements OnModuleInit {
  private i18n: i18n;

  async onModuleInit() {
    this.i18n = i18next.createInstance();
    await this.i18n.init({
      resources: {
        en: { translation: en },
        uk: { translation: uk },
      },
      fallbackLng: 'en',
      interpolation: { escapeValue: false },
    });
  }

  translate(key: string, lang: string, args?: Record<string, unknown>): string {
    return this.i18n.t(key, { lng: lang, ...args });
  }
}
