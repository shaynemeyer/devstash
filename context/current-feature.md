# Current Feature: Homepage Mockup

## Status

In Progress

## Goals

- Create a marketing homepage at `prototypes/homepage/` with `index.html`, `styles.css`, `script.js`
- Hero section shows "chaos to order" concept: floating chaos icons (left), pulsing arrow (center), dashboard preview (right)
- Fixed nav with logo, links, Sign In / Get Started buttons
- Features section with 6 cards using item type accent colors
- AI section with Pro badge and code editor mockup
- Pricing section with Free vs Pro cards and yearly toggle
- CTA and Footer sections
- Animations: chaos icons drift/bounce/repel from mouse; arrow pulses; scroll fade-in; navbar opacity on scroll
- Responsive: stacked layout on mobile, arrow rotates 90°

## Notes

- Output: `prototypes/homepage/index.html`, `styles.css`, `script.js` — standalone files, no Next.js
- Dark theme with item-type accent colors: Snippet #3b82f6, Prompt #f59e0b, Command #06b6d4, Note #22c55e, File #64748b, Image #ec4899, URL #6366f1
- Chaos icons: Notion, GitHub, Slack, VS Code logos + Browser tabs, Terminal, Text file, Bookmark
- Chaos animation via `requestAnimationFrame` — float, bounce off walls, repel from mouse cursor
- Dashboard preview: sidebar with nav items + grid of item cards with colored top borders
- Pricing: Free ($0, 50 items, 3 collections) vs Pro ($8/mo or $72/yr, unlimited, AI features); Pro card has "Most Popular" badge

## History

See [context/feature-history.md](feature-history.md) for the full archive of completed features.

- Favorite Item Toggle: toggleFavoriteItem server action; Favorite button wired in ItemDrawer with useTransition optimistic UI; toast on success/error; 5 Vitest tests

- Pinned Items: toggleItemPin server action; Pin button wired in ItemDrawer with useTransition optimistic UI; pinned items sort to top of type and collection listings; static pin icon on ItemCard; 5 Vitest tests
