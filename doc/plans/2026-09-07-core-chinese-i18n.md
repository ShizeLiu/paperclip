# Core Chinese I18n Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Paperclip board's core navigation and primary operator flows usable in Simplified Chinese without changing backend behavior.

**Architecture:** Keep the existing i18next setup and expand it in place. Add browser-language detection and localStorage persistence, then replace user-visible strings in the core shell and primary pages with translation keys while leaving plugin deep configuration and Storybook out of scope.

**Tech Stack:** React 19, TypeScript, Vite, i18next, react-i18next, Vitest.

---

### Task 1: Locale Selection Foundation

**Files:**
- Modify: `ui/src/i18n/index.ts`
- Modify: `ui/src/i18n/locales.ts`
- Test: `ui/src/i18n/locale-validation.test.ts`

- [ ] Add a supported-locale resolver that accepts `en`, `zh-CN`, and browser tags such as `zh`, `zh-Hans`, and `zh-CN`.
- [ ] Initialize i18next from `localStorage.paperclip.locale` when present, otherwise from `navigator.language`, otherwise `en`.
- [ ] Export a `setLocale` helper that calls `i18n.changeLanguage()` and persists the selected locale.
- [ ] Add tests for persisted locale, browser locale fallback, unsupported locale fallback, and Chinese tag normalization.

### Task 2: Language Switcher

**Files:**
- Create: `ui/src/components/LanguageSwitcher.tsx`
- Modify: `ui/src/App.tsx`
- Test: `ui/src/components/LanguageSwitcher.test.tsx`

- [ ] Add a compact language switcher using existing button/select primitives and design tokens.
- [ ] Mount it in the app shell where it is visible on core pages without disrupting layout.
- [ ] Verify switching between English and Simplified Chinese updates visible translated text and persists the choice.

### Task 3: Core Translation Catalog

**Files:**
- Modify: `ui/src/i18n/locales/en.json`
- Modify: `ui/src/i18n/locales/zh-CN.json`

- [ ] Add translation namespaces for `common`, `nav`, `status`, `priority`, `dashboard`, `companies`, `agents`, `issues`, `projects`, `goals`, and `settings`.
- [ ] Keep keys stable and semantic, for example `issues.actions.newIssue`, not `button42`.
- [ ] Keep English as the source catalog and Simplified Chinese as a faithful operator-facing translation.
- [ ] Run locale validation to confirm both locale files have matching shapes.

### Task 4: Core Shell And Pages

**Files:**
- Modify: `ui/src/App.tsx`
- Modify: selected core files under `ui/src/pages/`
- Modify: selected shared display components under `ui/src/components/`

- [ ] Replace visible hardcoded shell/navigation strings with `t(...)`.
- [ ] Replace main headings, empty states, primary action buttons, table headers, and status/priority labels in dashboard, companies, agents, issues/tasks, projects, goals, and settings.
- [ ] Leave deep plugin forms, adapter-specific advanced fields, raw logs, and test/storybook fixtures unchanged in this PR.

### Task 5: Verification

**Commands:**
- `pnpm --filter @paperclipai/ui test -- i18n`
- `pnpm --filter @paperclipai/ui typecheck`
- `pnpm check:token-gates`

- [ ] Confirm locale tests pass.
- [ ] Confirm UI typecheck passes.
- [ ] Confirm token gate still passes, since new UI must use token-backed styles only.
