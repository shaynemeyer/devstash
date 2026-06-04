# Refactor: Sidebar

## Status

Planned

## Goals

Split `Sidebar.tsx` (240 lines) into focused sub-components. The file contains a nested `SidebarInner` function (150+ lines) that handles type navigation, collections listing, and user area all inline. The desktop and mobile layouts are also entangled.

## Planned Split

### 1. `TypeNavigation.tsx` — `src/components/dashboard/TypeNavigation.tsx`

Renders the item type nav section in the sidebar:

- Receives `itemTypes: ItemTypeWithCount[]` and `isCollapsed: boolean` as props
- Renders each type as a nav link with icon, color dot, name, and count badge
- Hides name/count when collapsed

### 2. `CollectionsList.tsx` — `src/components/dashboard/CollectionsList.tsx`

Renders the collections section:

- Receives `collections: SidebarCollection[]` and `isCollapsed: boolean` as props
- Splits into favorites (starred) and recent
- Renders "View all collections" link at the bottom
- Hides labels when collapsed

### 3. `SidebarContent.tsx` — `src/components/dashboard/SidebarContent.tsx`

Composes the full sidebar body (extracted from the inline `SidebarInner` function):

- Renders `TypeNavigation` + `CollectionsList` + user avatar/dropdown
- Accepts `itemTypes`, `collections`, `isCollapsed` as props

### 4. `Sidebar.tsx` (reduced)

Becomes a thin layout wrapper (~50 lines):

- Manages `isCollapsed` state
- Renders desktop sidebar using `SidebarContent`
- Renders mobile overlay drawer using `SidebarContent`

## Notes

- No behavior changes — pure structural refactor
- `TypeNavigation` and `CollectionsList` become independently reusable
- Mobile and desktop layouts remain in `Sidebar.tsx` but delegate body rendering to `SidebarContent`

## History

- Feature planned
