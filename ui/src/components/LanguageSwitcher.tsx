import { Check, Languages } from "lucide-react";
import { useEffect, useState } from "react";

import { setLocale, useTranslation } from "@/i18n";
import { resolveSupportedLocale, type SupportedLocale } from "@/i18n/locales";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const LANGUAGE_OPTIONS: Array<{
  value: SupportedLocale;
  labelKey: string;
}> = [
  { value: "en", labelKey: "app.language.english" },
  { value: "zh-CN", labelKey: "app.language.simplifiedChinese" },
];

interface LanguageSwitcherProps {
  onAfterChange?: () => void;
}

export function LanguageSwitcher({ onAfterChange }: LanguageSwitcherProps) {
  const { t, i18n } = useTranslation();
  const [activeLocale, setActiveLocale] = useState(() => resolveSupportedLocale(i18n.language));

  useEffect(() => {
    function handleLanguageChange(locale: string) {
      setActiveLocale(resolveSupportedLocale(locale));
    }

    i18n.on("languageChanged", handleLanguageChange);
    return () => {
      i18n.off("languageChanged", handleLanguageChange);
    };
  }, [i18n]);

  async function handleSelect(locale: SupportedLocale) {
    const nextLocale = await setLocale(locale);
    setActiveLocale(nextLocale);
    onAfterChange?.();
  }

  const currentLabel = LANGUAGE_OPTIONS.find((option) => option.value === activeLocale)?.labelKey ?? "app.language.english";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex h-(--profile-popover-row-height) w-full items-center gap-(--profile-popover-row-gap) rounded-lg px-2.5 text-left text-(length:--text-compact) font-medium leading-(--profile-popover-label-line-height) text-foreground transition-colors hover:bg-accent"
          aria-label={t("app.language.menuLabel")}
        >
          <span className="flex size-5 shrink-0 items-center justify-center text-muted-foreground">
            <Languages className="size-4" />
          </span>
          <span className="min-w-0 flex-1 truncate">{t(currentLabel)}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="right">
        {LANGUAGE_OPTIONS.map((option) => {
          const selected = option.value === activeLocale;
          return (
            <DropdownMenuItem key={option.value} onClick={() => handleSelect(option.value)}>
              <span className="flex size-4 items-center justify-center">
                <Check className={cn("size-4", selected ? "opacity-100" : "opacity-0")} />
              </span>
              <span>{t(option.labelKey)}</span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
