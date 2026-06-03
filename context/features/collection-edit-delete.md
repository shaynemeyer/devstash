# Feature: Collection Edit, Delete, and Favorite

## Status

Not Started

## Goals

- On `/collections/[id]`: add Edit, Delete, and Favorite buttons in the page header
  - Edit opens a modal to update collection name and description
  - Delete shows a confirmation dialog; removes the collection and its `ItemCollection` rows but does NOT delete items
  - Favorite is a stub icon/button only — no logic yet
- On `/collections` cards: add a 3-dot (`MoreHorizontal`) icon that opens a dropdown menu with Edit, Delete, and Favorite options
  - Same modal for Edit, same confirmation dialog for Delete
  - Favorite is a stub only

## Implementation Plan

### 1. Server Actions (`src/actions/collections.ts`)

- `updateCollection(id, { name, description })` — auth + ownership check, Zod validation, updates DB
- `deleteCollection(id)` — auth + ownership check, deletes collection (Prisma cascade removes `ItemCollection` rows; items are untouched)

### 2. Zod Validation (`src/lib/validations/collections.ts`)

- Add `UpdateCollectionSchema` with `name` (required, 1–100 chars) and `description` (optional string)

### 3. DB Mutations (`src/lib/db/collections.ts`)

- `updateCollection(id, userId, data)` — update name/description where id + userId match
- `deleteCollection(id, userId)` — delete where id + userId match

### 4. Collection Detail Page (`/collections/[id]`)

- Add an action bar below the collection title with three icon buttons:
  - `Pencil` → opens `EditCollectionSheet`
  - `Trash2` → opens `DeleteCollectionDialog`
  - `Heart` → stub, no-op for now (renders but does nothing)
- Both modal/dialog components are client components

### 5. `EditCollectionSheet` (`src/components/collections/EditCollectionSheet.tsx`)

- ShadCN `Sheet` (right-side drawer, same pattern as `CreateCollectionDrawer`) with a form: Name input (required) + Description textarea (optional)
- On save: calls `updateCollection` server action, toasts on success, closes sheet, `router.refresh()`

### 6. `DeleteCollectionDialog` (`src/components/collections/DeleteCollectionDialog.tsx`)

- ShadCN `AlertDialog` confirming "Delete collection? Items will not be deleted."
- On confirm: calls `deleteCollection` server action, toasts on success, redirects to `/collections`

### 7. Collections List Page (`/collections`)

- Update `CollectionCard` to show a `MoreHorizontal` dots icon (visible on hover or always on mobile)
- Clicking the icon opens a ShadCN `DropdownMenu` with:
  - Edit → opens `EditCollectionSheet`
  - Delete → opens `DeleteCollectionDialog`
  - Favorite → stub, no-op
- `CollectionCard` becomes a client component to manage dropdown + modal state

### 8. Tests

- Vitest unit tests for `updateCollection` and `deleteCollection` server actions (auth check, ownership check, success case)

## Notes

- Items are never deleted — only the `ItemCollection` join rows are removed via Prisma cascade on `Collection` delete
- Favorite functionality will be implemented in a future feature; the button/menu item should be present but visually indicate it is coming (disabled or no-op)
- Reuse existing `EditCollectionSheet` and `DeleteCollectionDialog` across both the detail page and the card dropdown to avoid duplication
