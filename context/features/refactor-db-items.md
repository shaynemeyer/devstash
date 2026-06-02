# Refactor: lib/db/items.ts

## Status

Planned

## Goals

Split `src/lib/db/items.ts` (441 lines) to eliminate duplicated Prisma select patterns and object-mapping logic, and separate read queries from write mutations into two focused files.

## Planned Changes

### 1. Shared `ITEM_SELECT` constant

Extract the repeated Prisma `select` clause used across all read queries into a shared constant at the top of the file (or in a shared `src/lib/db/item-select.ts`):

```ts
export const ITEM_SELECT = {
  id: true,
  title: true,
  description: true,
  content: true,
  url: true,
  fileUrl: true,
  fileName: true,
  fileSize: true,
  language: true,
  isFavorite: true,
  isPinned: true,
  createdAt: true,
  updatedAt: true,
  type: { select: { id: true, name: true, icon: true, color: true } },
  tags: { select: { tag: { select: { id: true, name: true } } } },
} as const
```

### 2. Shared `mapToItemWithMeta()` helper

Extract the repeated object-mapping pattern (used in `getItemDetail`, `createItem`, `updateItem`) into a single typed helper function so it can't drift out of sync.

### 3. Split into two files

**`src/lib/db/items-queries.ts`** — read-only queries:
- `getItemsByTypeSlug()`
- `getPinnedItems()`
- `getRecentItems()`
- `getDashboardStats()`
- `getItemTypesWithCounts()`
- `getItemDetail()`

**`src/lib/db/items-mutations.ts`** — write operations:
- `createItem()`
- `updateItem()`
- `deleteItem()`

**`src/lib/db/items.ts`** — re-exports everything from both files so all existing imports continue to work without changes.

## Notes

- No behavior changes — pure structural refactor
- All existing import paths (`@/lib/db/items`) remain valid via re-export barrel
- `ITEM_SELECT` constant eliminates the most common source of drift between queries
- Split makes it easy to audit "what can write to the DB" separately from reads

## History

- Feature planned
