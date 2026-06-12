# Refactor: Components Folder — Scan 2

## Status

Not Started

## Goals

Break large components into smaller focused pieces and eliminate duplicate code found in `src/components/`. Prioritized by impact (lines removed, files affected).

---

## Findings

### 1. `useDrawerResize` hook — HIGH PRIORITY

**Files**: `src/components/items/ItemDrawer.tsx` (lines 15–66), `src/components/items/CreateItemDrawer.tsx` (lines 16–55)

Both drawers implement identical resize logic: localStorage key, `useState`/`useRef` for width tracking, and `handleResizeStart` pointer event handler with the same min/max calculations.

**Fix**: Extract `src/hooks/useDrawerResize.ts`

```ts
function useDrawerResize(key?: string, defaultWidth?: number): {
  width: number;
  widthRef: React.MutableRefObject<number>;
  handleResizeStart: (e: React.PointerEvent) => void;
}
```

**Impact**: ~50 lines removed across 2 files.

---

### 2. Content type classification constants — HIGH PRIORITY

**Files**: `src/components/items/ItemDrawerContent.tsx` (lines 16–20), `src/components/items/CreateItemForm.tsx` (lines 13–17)

Both define identical constants (`CONTENT_TYPES`, `LANGUAGE_TYPES`, `CODE_TYPES`, `MARKDOWN_TYPES`, `FILE_UPLOAD_TYPES`) and duplicate the logic for choosing editor type.

**Fix**: Extract `src/lib/content-types.ts` with shared constants + utility functions:

```ts
export function getEditorType(typeName: string): 'code' | 'markdown' | 'file' | 'url' | 'none'
export function getShownFields(typeName: string): { showContent, showLanguage, showUrl, showFileUpload }
```

**Impact**: Single source of truth for type rules; ~8 lines of duplication removed + prevents future divergence.

---

### 3. `ItemListRow` component — HIGH PRIORITY

**Files**: `src/components/dashboard/RecentItems.tsx` (lines 33–68), `src/components/dashboard/PinnedItems.tsx` (lines 32–69)

Both render item rows with near-identical JSX: type icon badge, title, description, tags, type color styling, date. ~35 lines of JSX each.

**Fix**: Extract `src/components/items/ItemListRow.tsx`

```tsx
interface ItemListRowProps {
  item: { id, title, description, typeIcon, typeColor, tags, createdAt };
  showTags?: boolean;
  onClick?: () => void;
}
```

**Impact**: ~70 lines of JSX duplication removed; consistent row styling across dashboard sections.

---

### 4. `useItemDrawerSelection` hook — MEDIUM PRIORITY

**Files**: `src/components/items/ItemsGrid.tsx`, `src/components/items/ImageGallery.tsx`, `src/components/items/FileList.tsx`

All three repeat identical state: `selectedId`, `drawerOpen`, `openDrawer` function, empty state JSX, and `ItemDrawer` at the bottom.

**Fix**: Extract `src/hooks/useItemDrawerSelection.ts`

```ts
function useItemDrawerSelection(): {
  selectedId: string | null;
  drawerOpen: boolean;
  openDrawer: (id: string) => void;
  setDrawerOpen: (open: boolean) => void;
}
```

**Impact**: ~25 lines removed across 3 files; simplifies adding new item list views.

---

### 5. `AIFeatureButton` component — MEDIUM PRIORITY

**Files**: `src/components/editors/CodeEditor.tsx` (lines 145–164), `src/components/editors/MarkdownEditor.tsx` (lines 108–127)

Both implement identical Pro-gated AI button pattern: if Pro → spinner + button; if not Pro → Crown icon + disabled span.

**Fix**: Extract `src/components/ai/AIFeatureButton.tsx`

```tsx
interface AIFeatureButtonProps {
  label: string;
  loading: boolean;
  isPro: boolean;
  onClick: () => void;
  disabled?: boolean;
}
```

**Impact**: ~20 lines removed; centralizes Pro feature UI; reusable for future AI buttons.

---

### 6. `TypeBadge` component — MEDIUM PRIORITY

**Files**: `src/components/items/ItemCard.tsx`, `src/components/items/ItemDrawerHeader.tsx`, `src/components/dashboard/PinnedItems.tsx`, `src/components/dashboard/RecentItems.tsx`

Inline styles `backgroundColor: typeColor + "22"` and `color: typeColor` on a rounded badge appear in 4+ places with slight variations.

**Fix**: Extract `src/components/items/TypeBadge.tsx`

```tsx
interface TypeBadgeProps {
  icon: LucideIcon;
  color: string;
  size?: 'sm' | 'md';
}
```

**Impact**: ~15 lines of inline style duplication removed; centralized badge styling.

---

### 7. `FormField` component — LOW PRIORITY

**Files**: `src/components/auth/SignInForm.tsx`, `src/components/auth/RegisterForm.tsx`, `src/components/profile/ChangePasswordForm.tsx`

All repeat the same `<div className="space-y-1.5"> + <label> + <Input>` pattern.

**Fix**: Extract `src/components/auth/FormField.tsx`

```tsx
interface FormFieldProps {
  label: string;
  id: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  autoComplete?: string;
}
```

**Impact**: ~20 lines per form; consistent label + input styling across auth forms.

---

### 8. `useOptimisticToggle` hook — LOW PRIORITY

**Files**: `src/components/items/ItemDrawer.tsx` (lines 113–141), `src/components/collections/CollectionCard.tsx` (lines 31–43)

Both implement the same optimistic toggle pattern: flip state, call server action, rollback on error with toast.

**Fix**: Extract `src/hooks/useOptimisticToggle.ts`

```ts
function useOptimisticToggle<T>(
  initialValue: T,
  action: (id: string, prev: T) => Promise<{ success: boolean }>,
  config?: { successMessage?: string; errorMessage?: string }
): { value: T; isPending: boolean; toggle: (id: string) => void }
```

**Impact**: ~15 lines per toggle; unified error handling pattern.

---

## Implementation Order

| # | Task | Priority | Est. Lines Saved |
|---|------|----------|-----------------|
| 1 | `useDrawerResize` hook | HIGH | ~50 |
| 2 | `src/lib/content-types.ts` constants + utils | HIGH | ~8 + future-proof |
| 3 | `ItemListRow` component | HIGH | ~70 |
| 4 | `useItemDrawerSelection` hook | MEDIUM | ~25 |
| 5 | `AIFeatureButton` component | MEDIUM | ~20 |
| 6 | `TypeBadge` component | MEDIUM | ~15 |
| 7 | `FormField` component | LOW | ~60 total |
| 8 | `useOptimisticToggle` hook | LOW | ~30 total |

## Notes

- Each item is an independent, self-contained change — implement and test one at a time
- No business logic changes — pure structural refactors
- After each extraction, run `npm run build` to verify no regressions
- Items 1–3 have the highest ROI; items 7–8 are optional polish
