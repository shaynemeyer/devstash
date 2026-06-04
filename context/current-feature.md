# Current Feature: Pagination

## Status

In Progress

## Goals

- Add pagination to `/items/[type]` and `/collections/[id]` pages
- Pagination controls at bottom with page numbers and prev/next links
- Disable (grey out) prev/next when not available
- Only fetch the records needed for the current page (no fetching all)

## Notes

- `ITEMS_PER_PAGE = 21`, `COLLECTIONS_PER_PAGE = 21`
- Dashboard limits: `DASHBOARD_COLLECTIONS_LIMIT = 6`, `DASHBOARD_RECENT_ITEMS_LIMIT = 10` (unchanged)
- Use numbered page links with prev/next controls

## History

See [context/feature-history.md](feature-history.md) for the full archive of completed features.

- Global Search / Command Palette: CommandPalette component (ShadCN cmdk) with grouped Items/Collections sections; client-side fuzzy search pre-fetched on mount via getSearchData server action; Cmd+K / Ctrl+K shortcut and TopBar click to open; item select opens ItemDrawer, collection select navigates to /collections/[id]; fixed "1 items" pluralization in 3 locations; 5 Vitest tests added
