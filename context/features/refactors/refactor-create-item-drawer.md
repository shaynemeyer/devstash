# Refactor: CreateItemDrawer

## Status

Planned

## Goals

Split `CreateItemDrawer.tsx` (276 lines) into a hook, a type selector, and a form component. The component currently manages 9 form field state variables inline and duplicates content-rendering patterns from `ItemDrawer`.

## Planned Split

### 1. `useCreateItemForm()` hook — `src/hooks/useCreateItemForm.ts`

Extract all form state and logic:

- State: `title`, `description`, `content`, `url`, `language`, `tagsInput`, `uploadedFile`, `saving`
- `reset()` — clears all fields back to defaults
- `handleSubmit()` — calls `createItem` action, handles toast, resets, closes drawer
- Tag parsing: splits `tagsInput` string into array

### 2. `ItemTypeSelector.tsx` — `src/components/items/ItemTypeSelector.tsx`

Standalone type selection UI:

- Receives `itemTypes`, `selectedTypeId`, `onChange` as props
- Renders the grid of type buttons with icon + name
- Reusable if a "change type" flow is added to edit mode later

### 3. `CreateItemForm.tsx` — `src/components/items/CreateItemForm.tsx`

Renders form fields conditional on the selected type:

- Accepts `selectedType` and field values/setters as props
- Title field (always shown)
- Description field (always shown)
- Content: CodeEditor for Snippet/Command, MarkdownEditor for Note/Prompt
- URL field for Link type
- Language selector for Snippet/Command
- FileUpload for File/Image types
- Tags input (always shown)

### 4. `CreateItemDrawer.tsx` (reduced)

Becomes a thin orchestrator (~80 lines):

- Fetches item types on mount
- Composes `ItemTypeSelector` + `CreateItemForm` inside the Sheet
- Uses `useCreateItemForm()` hook
- Manages `open` prop and passes `defaultType`

## Notes

- No behavior changes — pure structural refactor
- `ItemTypeSelector` can be shared with a future "change type" feature in `ItemDrawer`
- `CreateItemForm` makes the form independently testable
- Reduces state management in the drawer component to nearly zero

## History

- Feature planned
