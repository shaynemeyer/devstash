# Current Feature

## Status

Not Started

## Goals

## Notes

## History

See [context/feature-history.md](feature-history.md) for the full archive of completed features.

- Drawer Font Size & Width: `sm:max-w-lg` → `sm:max-w-2xl` in ItemDrawer; title/input `text-base` → `text-lg` in ItemDrawerHeader; all action buttons + download link `text-xs` → `text-sm` in ItemDrawerActionBar; MarkdownEditor toolbar `text-xs` → `text-sm`, textarea `text-sm` → `text-base`, preview `prose-sm` → `prose-base`
- AI Optimize Prompt: optimizePrompt server action (auth, Pro gate, Zod, 20 req/hr rate limit); Optimize button in MarkdownEditor header for prompt read view; optimized result panel with Use This/Dismiss; applyOptimized in useItemEdit switches drawer to edit mode; Crown icon for free users; 8 unit tests
