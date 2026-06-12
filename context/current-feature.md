# Current Feature: UI Review Fixes

## Status

In Progress

## Goals

- Add active link highlighting to sidebar type links (`TypeNavigation.tsx`) using `usePathname()`
- Add active link highlighting to sidebar collection links (`CollectionsList.tsx`) using `usePathname()`
- Add GitHub OAuth button to the register page (`RegisterForm.tsx`) matching the sign-in layout
- Move Favorites link from the header into the sidebar (`SidebarContent.tsx`) as a nav link
- Add a Dashboard nav entry to the sidebar with active state
- Highlight the current collection in the sidebar when viewing `/collections/[id]`

## Notes

- Active state class: `bg-sidebar-accent text-sidebar-foreground font-medium`
- GitHub button uses `signIn("github", { callbackUrl: "/dashboard" })` from `next-auth/react`
- Match the sign-in layout: GitHub button above the form with an "or" divider
- Favorites currently lives in the top header bar alongside "New Collection" and "New Item"
- Priority order: active highlights → GitHub register button → Favorites in sidebar → Dashboard link → Collection active state
- Active collection check: `pathname === /collections/${id}` in `CollectionsList.tsx`

## History

See [context/feature-history.md](feature-history.md) for the full archive of completed features.

- Drawer Font Size & Width: `sm:max-w-lg` → `sm:max-w-2xl` in ItemDrawer; title/input `text-base` → `text-lg` in ItemDrawerHeader; all action buttons + download link `text-xs` → `text-sm` in ItemDrawerActionBar; MarkdownEditor toolbar `text-xs` → `text-sm`, textarea `text-sm` → `text-base`, preview `prose-sm` → `prose-base`
- AI Optimize Prompt: optimizePrompt server action (auth, Pro gate, Zod, 20 req/hr rate limit); Optimize button in MarkdownEditor header for prompt read view; optimized result panel with Use This/Dismiss; applyOptimized in useItemEdit switches drawer to edit mode; Crown icon for free users; 8 unit tests
- Resizable Item Drawer: drag handle on left edge of SheetContent; pointer events resize width between `floor(innerWidth/3)` min and `85vw` max; width persisted to localStorage (`item-drawer-width`); default 672px
