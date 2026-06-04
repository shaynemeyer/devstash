# Feature: Create Collection

## Status

Planned

## Goals

Implement collection "create" flow. The "New Collection" button in the TopBar opens a Sheet drawer with name + description fields. On save, the new collection is created and the UI refreshes. Toasts shown on success/failure.

## Notes

- Follow the same pattern as `CreateItemDrawer` / `useCreateItemForm` / `createItem`
- No type selector needed — collections have just name and optional description
- The "New Collection" button already exists in TopBar but has no `onClick` wired
