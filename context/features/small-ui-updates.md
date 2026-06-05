# Small UI Updates

## Status

In Progress

## Goals

1. **Auth page nav** — Add the marketing `NavBar` to `/sign-in` and `/register` pages so they share the same top navigation as the homepage.
2. **Dashboard sidebar logo** — Add the same folder/box SVG logo (from the marketing NavBar) to the dashboard sidebar header. Show icon + "DevStash" text when expanded; icon only when collapsed.

## Implementation Plan

### Auth pages

- Import and render `<NavBar />` at the top of `/sign-in/page.tsx` and `/register/page.tsx`
- Add `pt-16` to the page wrapper so content clears the fixed nav

### Dashboard sidebar

- Extract the logo SVG from `NavBar.tsx` into the `SidebarContent.tsx` header row
- Show logo left-aligned; keep the collapse toggle right-aligned
- When `collapsed`, show icon only (centered); when expanded, show icon + "DevStash" wordmark

## Notes

- Reuse the existing `NavBar` component as-is on auth pages
- No new component needed for the sidebar logo — inline the SVG directly
