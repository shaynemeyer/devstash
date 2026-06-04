# Add Client-Side Sorting to Favorites

## Overview

Add client-side sorting controls to the `/favorites` page so users can sort favorited items and collections by name, date, or type.

## Requirements

- Add a sort control (dropdown or toggle group) to the favorites page header
- Sorting applies to both the items list and the collections list independently
- Sort options:
  - **Name** — alphabetical A→Z (default toggle: A→Z / Z→A)
  - **Date** — by `updatedAt` descending (default toggle: newest / oldest)
  - **Type** — alphabetical by type name A→Z (items only; collections have no type)
- Default sort: Date descending (matches current behavior)
- Sort state is client-side only — no server round-trip or URL persistence needed
- Keep the compact list-view style; the sort control should be minimal and inline with the section header

## UI

- Place a single sort control in the page header area (above both sections)
- Use a `<select>` or ShadCN `Select` component — keep it lightweight
- Label: "Sort by"
- Options: Name, Date, Type
- A secondary direction toggle (asc/desc) next to the sort select, or built into the option labels

## Implementation Notes

- The favorites page (`src/app/favorites/page.tsx` or the client component within it) already fetches and renders items/collections
- Move the sort/filter logic into the existing client component; no new server action needed
- Use `useState` for sort field and direction; derive the sorted lists with `useMemo`
- For the **Type** sort on collections, hide or disable that option since collections have no type — or show it as a no-op gracefully
