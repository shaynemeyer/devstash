# Current Feature: User Settings Page

## Status

In Progress

## Goals

- Add a `/settings` route that is auth-protected
- Add a **Settings** link in the sidebar user-icon dropdown (alongside Profile and Sign out)
- Move **Account actions** from `/profile` to `/settings`:
  - Delete account (`DeleteAccountDialog`)
  - Change password (`ChangePasswordForm`, email users only)

## Notes

- New `src/app/settings/page.tsx` — auth-protected, uses `getProfileUser`, renders inside `DashboardShell`
- `/profile` keeps: account info (avatar, name, email, member since) and usage stats
- `/settings` contains: Change password (email users only, gated on `profileUser.hasPassword`) + Danger zone (delete account)
- Add Settings link to `SidebarUserArea.tsx` dropdown (between Profile and Sign out), icon: `Settings` from lucide-react
- No new DB queries, migrations, or server actions needed — reuse `getProfileUser`

## History

See [context/feature-history.md](feature-history.md) for the full archive of completed features.

- Pagination: PaginationControls component with numbered page links and disabled prev/next; ITEMS_PER_PAGE=21 / COLLECTIONS_PER_PAGE=21 constants; server-side skip/take on getItemsByTypeSlug and getItemsByCollectionId; ?page= searchParam on /items/[type] and /collections/[id]; 7 Vitest tests for getPageNumbers utility

- Global Search / Command Palette: CommandPalette component (ShadCN cmdk) with grouped Items/Collections sections; client-side fuzzy search pre-fetched on mount via getSearchData server action; Cmd+K / Ctrl+K shortcut and TopBar click to open; item select opens ItemDrawer, collection select navigates to /collections/[id]; fixed "1 items" pluralization in 3 locations; 5 Vitest tests added
