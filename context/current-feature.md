# Current Feature

## Status

Not Started

## Goals

## Notes

## History

See [context/feature-history.md](feature-history.md) for the full archive of completed features.

- Pagination: PaginationControls component with numbered page links and disabled prev/next; ITEMS_PER_PAGE=21 / COLLECTIONS_PER_PAGE=21 constants; server-side skip/take on getItemsByTypeSlug and getItemsByCollectionId; ?page= searchParam on /items/[type] and /collections/[id]; 7 Vitest tests for getPageNumbers utility

- Global Search / Command Palette: CommandPalette component (ShadCN cmdk) with grouped Items/Collections sections; client-side fuzzy search pre-fetched on mount via getSearchData server action; Cmd+K / Ctrl+K shortcut and TopBar click to open; item select opens ItemDrawer, collection select navigates to /collections/[id]; fixed "1 items" pluralization in 3 locations; 5 Vitest tests added

- User Settings Page: new /settings route (auth-protected) with ChangePasswordForm (email users only) and DeleteAccountDialog moved from /profile; Settings link added to SidebarUserArea dropdown; /profile now shows account info and usage stats only
