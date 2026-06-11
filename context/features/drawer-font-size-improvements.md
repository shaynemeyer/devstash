# Feature: Drawer Font Size & Width Improvements

## Status

Not Started

## Goals

Improve readability of the item drawer by increasing font sizes for key interactive and content elements, and widening the drawer panel to use at least a third of the screen.

## Scope

### 1. Drawer Width — `ItemDrawer.tsx`

- `SheetContent` class: `sm:max-w-lg` → `sm:max-w-2xl`

### 2. Drawer Title — `ItemDrawerHeader.tsx`

- `SheetTitle` class: `text-base` → `text-lg`
- Edit mode `input` class: `text-base` → `text-lg`

### 3. Action Bar Buttons — `ItemDrawerActionBar.tsx`

- All action buttons use `text-xs` — change to `text-sm`
- Applies to: Favorite, Pin, Copy, Edit, Cancel, Save (view and edit modes)
- The download `<a>` link also uses `text-xs` — change to `text-sm`

### 4. Markdown Editor — `MarkdownEditor.tsx`

- Toolbar buttons (Write, Preview, Copy, Optimize): `text-xs` → `text-sm`
- Write textarea: `text-sm` → `text-base`
- Preview div: `prose-sm` → `prose-base`

## Out of Scope

- Code editor font size (user-controlled via editor settings)
- Section labels (DESCRIPTION, CONTENT, etc.) — `text-xs` + uppercase + tracking-wide is an acceptable label pattern
- Tag/collection pills — intentionally compact at `text-xs`
- Details metadata — intentionally de-emphasized at `text-xs`

## Notes

- Measured via Playwright computed styles before making changes
- No new components, no new dependencies
