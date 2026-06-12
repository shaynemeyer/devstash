# Current Feature

## Status

Not Started

## Goals

## Notes

## History

See [context/feature-history.md](feature-history.md) for the full archive of completed features.

- Actions Shared Utilities: new `src/lib/action-utils.ts` with `ActionError`, `requireAuth`, `parseInput`, `requireProWithRateLimit`, `withAction`; refactored `items.ts`, `collections.ts`, `ai.ts`, `settings.ts` to eliminate repeated auth/validation/error boilerplate
- Drawer Font Size & Width: `sm:max-w-lg` → `sm:max-w-2xl` in ItemDrawer; title/input `text-base` → `text-lg` in ItemDrawerHeader; all action buttons + download link `text-xs` → `text-sm` in ItemDrawerActionBar; MarkdownEditor toolbar `text-xs` → `text-sm`, textarea `text-sm` → `text-base`, preview `prose-sm` → `prose-base`
- AI Optimize Prompt: optimizePrompt server action (auth, Pro gate, Zod, 20 req/hr rate limit); Optimize button in MarkdownEditor header for prompt read view; optimized result panel with Use This/Dismiss; applyOptimized in useItemEdit switches drawer to edit mode; Crown icon for free users; 8 unit tests
- Resizable Item Drawer: drag handle on left edge of SheetContent; pointer events resize width between `floor(innerWidth/3)` min and `85vw` max; width persisted to localStorage (`item-drawer-width`); default 672px
- UI Review Fixes: `usePathname()` active state on TypeNavigation + CollectionsList; GitHub OAuth button on RegisterForm; Dashboard + Favorites nav links in sidebar; Favorites removed from TopBar
