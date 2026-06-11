# Current Feature: Resizable Item Drawer

## Status

In Progress

## Goals

- Add a horizontal drag handle to the left edge of the item drawer
- Allow the user to resize the drawer width by dragging
- Minimum width: 1/3 of available screen width
- Maximum width: reasonable upper bound (e.g. 80vw or full available content area)
- Persist the drawer width across sessions (localStorage)
- Resize should feel smooth and not interfere with drawer content

## Notes

- The drawer is rendered in `ItemDrawer` (likely `src/components/items/ItemDrawer.tsx`)
- Currently uses a fixed Tailwind width class (`sm:max-w-2xl`)
- Need to switch from a static max-width to a dynamic inline width controlled by drag state
- Use a mouse/pointer event drag handler on the left edge — no external library needed
- Min width constraint: `window.innerWidth / 3`
- Should work on desktop (pointer events); mobile resize is not required

## History

See [context/feature-history.md](feature-history.md) for the full archive of completed features.

- Drawer Font Size & Width: `sm:max-w-lg` → `sm:max-w-2xl` in ItemDrawer; title/input `text-base` → `text-lg` in ItemDrawerHeader; all action buttons + download link `text-xs` → `text-sm` in ItemDrawerActionBar; MarkdownEditor toolbar `text-xs` → `text-sm`, textarea `text-sm` → `text-base`, preview `prose-sm` → `prose-base`
- AI Optimize Prompt: optimizePrompt server action (auth, Pro gate, Zod, 20 req/hr rate limit); Optimize button in MarkdownEditor header for prompt read view; optimized result panel with Use This/Dismiss; applyOptimized in useItemEdit switches drawer to edit mode; Crown icon for free users; 8 unit tests
