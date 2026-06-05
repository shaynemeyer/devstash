# Current Feature

## Status

Not Started

## Goals

## Notes

## History

See [context/feature-history.md](feature-history.md) for the full archive of completed features.

- Homepage Cleanup: extracted MARKETING_ITEM_TYPES / CODE_EDITOR_BG / CODE_EDITOR_TITLEBAR_BG / AI_TAGS / CODE_LINES as constants; added aria roles to SVG logos and ChaosArena icons; replaced PricingToggle inline style with Tailwind classes; used cn() in FadeIn; named FADE_IN_THRESHOLD; fixed shrink-0 classes; standardized section spacing

- Marketing Homepage: public-facing `/` route with (marketing) route group; auth redirect to /dashboard; NavBar (sticky, scroll-aware); Hero with CSS-animated ChaosArena (8 bouncing SVG icons) and mini dashboard preview; FeaturesSection (6 type cards); AISection (Pro badge, code editor mockup, AI tags); PricingSection with monthly/yearly PricingToggle; CTASection; Footer with dynamic year; FadeIn scroll wrapper; fully static, no DB queries

- Homepage Mockup: standalone marketing prototype at prototypes/homepage/; dark theme; animated chaos-to-order hero with bouncing SVG icons; features grid with DevStash item type colors and Lucide icons; AI section; pricing toggle; isometric box logo SVG

- Favorite Item Toggle: toggleFavoriteItem server action; Favorite button wired in ItemDrawer with useTransition optimistic UI; toast on success/error; 5 Vitest tests

- Pinned Items: toggleItemPin server action; Pin button wired in ItemDrawer with useTransition optimistic UI; pinned items sort to top of type and collection listings; static pin icon on ItemCard; 5 Vitest tests
