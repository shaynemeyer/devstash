# Small Enhancements 1

## Status

Planned

## Features

### 1. Quick Copy Icon on Item Cards

Add a copy icon to `ItemCard` that appears on hover. Clicking it copies the item's primary content to the clipboard without opening the drawer.

**Copy value per type:**

- Snippet, Command, Prompt, Note → `content`
- Link → `url`
- File, Image → no icon shown (null value skips render)

**UX:**

- Icon appears in the **bottom-right corner** of the card on hover (opacity-0 → opacity-100)
- Click shows `Check` icon for 1.5s, then reverts to `Copy`
- Clicking the icon does NOT open the drawer (stopPropagation)

**Components:**

- New: `src/components/items/CopyButton.tsx` — `"use client"`, Copy/Check toggle, clipboard write
- Modified: `src/components/items/ItemCard.tsx` — add `group` class, render `<CopyButton value={item.content ?? item.url} />`
- Modified: `src/lib/db/items.ts` — add `content` and `url` to `ItemWithMeta` and `toItemWithMeta`

## Notes

- No query changes needed: `.include()` already fetches all `Item` fields; only the mapper and interface need updating.
- `ImageThumbnailCard` and `FileListRow` are out of scope for this feature.

## History

- Feature planned
