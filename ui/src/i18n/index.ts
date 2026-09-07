import i18n, { type InitOptions, type TOptions } from "i18next";
import { initReactI18next, useTranslation as useReactI18nextTranslation } from "react-i18next";

import {
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  i18nextResources,
  resolveSupportedLocale,
  supportedLocales,
  type SupportedLocale,
} from "./locales";

function safelyReadStoredLocale() {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(LOCALE_STORAGE_KEY);
  } catch {
    return null;
  }
}

function safelyWriteStoredLocale(locale: SupportedLocale) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    // Ignore storage failures; language switching should still work in-memory.
  }
}

function browserLocale() {
  if (typeof window === "undefined") return null;
  return window.navigator.languages?.[0] ?? window.navigator.language ?? null;
}

export function getInitialLocale() {
  return resolveSupportedLocale(safelyReadStoredLocale() ?? browserLocale() ?? DEFAULT_LOCALE);
}

const i18nextOptions: InitOptions = {
  resources: i18nextResources,
  lng: getInitialLocale(),
  fallbackLng: DEFAULT_LOCALE,
  supportedLngs: supportedLocales,
  defaultNS: "translation",
  interpolation: { escapeValue: false },
  returnObjects: false,
  initAsync: false,
};

void i18n.use(initReactI18next).init(i18nextOptions).catch((error: unknown) => {
  console.error("Failed to initialize i18next", error);
});

export function t(key: string, options: TOptions = {}) {
  return i18n.t(key, options);
}

export async function setLocale(locale: string) {
  const resolved = resolveSupportedLocale(locale);
  await i18n.changeLanguage(resolved);
  safelyWriteStoredLocale(resolved);
  return resolved;
}

export const useTranslation = useReactI18nextTranslation;
export { i18n };
