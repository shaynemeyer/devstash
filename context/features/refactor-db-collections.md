# Refactor: lib/db/collections.ts

## Status

Planned

## Goals

Remove duplicated type-counting and dominant-color logic from `src/lib/db/collections.ts` (119 lines). Two functions — `getSidebarCollections()` and `getRecentCollections()` — both contain nearly identical loops to count item types per collection and derive the dominant color.

## Planned Changes

### 1. Extract `getDominantColor()` helper

```ts
function getDominantColor(items: { type: { color: string } }[]): string {
  const counts: Record<string, number> = {}
  for (const item of items) {
    counts[item.type.color] = (counts[item.type.color] ?? 0) + 1
  }
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1])
  return sorted[0]?.[0] ?? "#6b7280"
}
```

### 2. Replace inline loops with the helper

Both `getSidebarCollections()` and `getRecentCollections()` call `getDominantColor(collection.items)` instead of repeating the loop inline.

## Notes

- ~20 lines of duplicate logic removed
- Helper is file-private (not exported) — only used within `collections.ts`
- No behavior changes

## History

- Feature planned
