import type { Resource } from "i18next";

import { assertValidLocaleMessages } from "./locale-validation";

export const DEFAULT_LOCALE = "en" as const;
export const LOCALE_STORAGE_KEY = "paperclip.locale" as const;

const localeModules = import.meta.glob("./locales/*.json", {
  eager: true,
  import: "default",
}) as Record<string, unknown>;

const rawLocaleMessages = Object.fromEntries(
  Object.entries(localeModules).map(([path, messages]) => {
    const locale = path.match(/\/([A-Za-z0-9_-]+)\.json$/)?.[1];
    if (!locale) {
      throw new Error(`Invalid locale file path: ${path}`);
    }
    return [locale, messages];
  }),
);

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function mergeWithEnglishFallback(englishReference: unknown, localeOverride: unknown): unknown {
  if (!isPlainObject(englishReference) || !isPlainObject(localeOverride)) {
    return localeOverride ?? englishReference;
  }

  const merged: Record<string, unknown> = { ...localeOverride };
  for (const [key, englishValue] of Object.entries(englishReference)) {
    merged[key] = key in localeOverride
      ? mergeWithEnglishFallback(englishValue, localeOverride[key])
      : englishValue;
  }
  return merged;
}

if (!(DEFAULT_LOCALE in rawLocaleMessages)) {
  throw new Error(`Missing default locale messages for ${DEFAULT_LOCALE}`);
}

export const localeMessages = Object.fromEntries(
  Object.entries(rawLocaleMessages).map(([locale, messages]) => [
    locale,
    mergeWithEnglishFallback(rawLocaleMessages[DEFAULT_LOCALE], messages),
  ]),
);

for (const [locale, messages] of Object.entries(localeMessages)) {
  try {
    assertValidLocaleMessages(messages);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Invalid ${locale} locale messages: ${message}`);
  }
}

export const supportedLocales = Object.keys(localeMessages);

export type SupportedLocale = string;

export function isSupportedLocale(locale: string): locale is SupportedLocale {
  return locale in localeMessages;
}

export function resolveSupportedLocale(locale: string | null | undefined): SupportedLocale {
  if (!locale) return DEFAULT_LOCALE;

  const normalized = locale.replace(/_/g, "-");
  if (isSupportedLocale(normalized)) return normalized;

  const lower = normalized.toLowerCase();
  if (lower === "zh" || lower === "zh-cn" || lower === "zh-hans" || lower.startsWith("zh-hans-")) {
    return isSupportedLocale("zh-CN") ? "zh-CN" : DEFAULT_LOCALE;
  }
  if (lower === "zh-tw" || lower === "zh-hant" || lower.startsWith("zh-hant-")) {
    return isSupportedLocale("zh-TW") ? "zh-TW" : DEFAULT_LOCALE;
  }

  const base = lower.split("-")[0];
  return supportedLocales.find((candidate) => candidate.toLowerCase() === base) ?? DEFAULT_LOCALE;
}

export const i18nextResources: Resource = Object.fromEntries(
  Object.entries(localeMessages).map(([locale, messages]) => [locale, { translation: messages }]),
) as Resource;
