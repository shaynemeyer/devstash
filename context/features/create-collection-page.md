# Feature: Collections Pages

## Status

In Progress

## Goals

- Create `/collections` page listing all user collections in a card grid
- Create `/collections/[id]` page showing items in a specific collection
- Link sidebar "View all collections" and collection cards to the correct routes (links already exist in code)

## Notes

- Reuse existing `CollectionWithMeta` type and card design from `RecentCollections`
- Extract a `CollectionCard` component to avoid duplication
- Use `ItemsGrid` on the detail page (same as `/items/[type]`)
- New DB queries needed: `getAllCollections` and `getCollectionDetail`
