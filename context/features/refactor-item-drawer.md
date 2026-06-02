# Refactor: ItemDrawer

## Status

Planned

## Goals

Split `ItemDrawer.tsx` (619 lines) into focused, single-responsibility components and a custom hook. The component currently handles view mode, edit mode, delete confirmation, file/image display, code/markdown rendering, and 20+ state variables all in one file.

## Planned Split

### 1. `useItemEdit()` hook — `src/hooks/useItemEdit.ts`

Extract all edit-mode state and logic:

- State: `editMode`, `saving`, `title`, `description`, `content`, `language`, `url`, `tagsInput`
- `handleSave()` — calls `updateItem` action, handles toast and router refresh
- `handleCancel()` — resets all fields back to item values
- `useEffect` that resets state when `item.id` changes

### 2. `ItemDrawerHeader.tsx` — `src/components/items/ItemDrawerHeader.tsx`

Renders the drawer header section:

- Item title (editable input in edit mode, plain text in view mode)
- Type badge with color and icon
- Language badge for Snippet/Command types

### 3. `ItemDrawerActionBar.tsx` — `src/components/items/ItemDrawerActionBar.tsx`

Renders the action bar buttons and delete dialog:

- View mode: Favorite, Pin, Copy, Edit, Delete buttons
- Edit mode: Save, Cancel buttons
- Contains the `AlertDialog` confirmation for delete
- Receives `item`, `editMode`, `saving`, `deleting`, and all callbacks as props

### 4. `ItemDrawerContent.tsx` — `src/components/items/ItemDrawerContent.tsx`

Renders the content section based on item type:

- Snippet/Command → `CodeEditor`
- Note/Prompt → `MarkdownEditor`
- File → file info card + download button
- Image → image preview
- Handles view vs. edit mode switching per type

### 5. `ItemDrawer.tsx` (reduced)

Becomes a thin orchestrator (~100 lines):

- Fetches item detail via API on open
- Composes `ItemDrawerHeader`, `ItemDrawerActionBar`, `ItemDrawerContent`
- Manages `open` state and skeleton loading
- Uses `useItemEdit()` hook

## Notes

- No behavior changes — pure structural refactor
- All existing props/callbacks remain the same externally
- `useItemEdit` hook enables unit testing of save/cancel logic in isolation
- `ItemDrawerContent` can eventually be reused if a full-page item view is added

## History

- Feature planned
