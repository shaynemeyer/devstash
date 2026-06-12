# Current Feature: Refactor Actions Shared Utilities

## Status

In Progress

## Goals

- Extract repeated auth/validation/error boilerplate from `src/actions/` into `src/lib/action-utils.ts`
- Reduce duplication across 5 action files: `items.ts`, `collections.ts`, `ai.ts`, `settings.ts`, `search.ts`
- New shared helpers: `ActionError`, `requireAuth()`, `parseInput()`, `requireProWithRateLimit()`, `withAction()`
- No client-side changes required — return shape `{ success, data?, error? }` stays the same

## Notes

- `action-utils.ts` must NOT have `"use server"` — it's a plain utility module
- `withAction` wraps function bodies and handles all error catching uniformly
- `requireProWithRateLimit` lives in `action-utils.ts` (not `ai.ts`) for future reuse
- Implementation plan is in `context/features/refactor-scan-1.md` — Steps 1–7

## History

See [context/feature-history.md](feature-history.md) for the full archive of completed features.

- Drawer Font Size & Width: `sm:max-w-lg` → `sm:max-w-2xl` in ItemDrawer; title/input `text-base` → `text-lg` in ItemDrawerHeader; all action buttons + download link `text-xs` → `text-sm` in ItemDrawerActionBar; MarkdownEditor toolbar `text-xs` → `text-sm`, textarea `text-sm` → `text-base`, preview `prose-sm` → `prose-base`
- AI Optimize Prompt: optimizePrompt server action (auth, Pro gate, Zod, 20 req/hr rate limit); Optimize button in MarkdownEditor header for prompt read view; optimized result panel with Use This/Dismiss; applyOptimized in useItemEdit switches drawer to edit mode; Crown icon for free users; 8 unit tests
- Resizable Item Drawer: drag handle on left edge of SheetContent; pointer events resize width between `floor(innerWidth/3)` min and `85vw` max; width persisted to localStorage (`item-drawer-width`); default 672px
- UI Review Fixes: `usePathname()` active state on TypeNavigation + CollectionsList; GitHub OAuth button on RegisterForm; Dashboard + Favorites nav links in sidebar; Favorites removed from TopBar
