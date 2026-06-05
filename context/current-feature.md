# Current Feature: Small UI Updates

## Status

In Progress

## Goals

1. **Auth page nav** — Add the marketing `NavBar` to `/sign-in` and `/register` pages so they share the same top navigation as the homepage.
2. **Dashboard sidebar logo** — Add the same folder/box SVG logo (from the marketing NavBar) to the dashboard sidebar header. Show icon + "DevStash" text when expanded; icon only when collapsed.

## Notes

- Auth pages: Import and render `<NavBar />` at the top of `/sign-in/page.tsx` and `/register/page.tsx`; add `pt-16` to page wrapper so content clears the fixed nav
- Sidebar: Extract the logo SVG from `NavBar.tsx` into `SidebarContent.tsx` header row; icon left-aligned, collapse toggle right-aligned; collapsed = icon only (centered), expanded = icon + "DevStash" wordmark
- Reuse existing `NavBar` component as-is on auth pages — no new component needed for sidebar logo, inline the SVG directly

## History

See [context/feature-history.md](feature-history.md) for the full archive of completed features.

- Homepage Cleanup: extracted shared constants; added aria roles to SVG logos and ChaosArena icons; replaced inline styles with Tailwind classes; used cn() in FadeIn
- Marketing Homepage: public-facing `/` route with NavBar, Hero/ChaosArena, FeaturesSection, AISection, PricingSection, CTASection, Footer; fully static
