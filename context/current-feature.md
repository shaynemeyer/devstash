# Current Feature: Marketing Homepage

## Status

In Progress

## Goals

- Build the public-facing marketing homepage at `/` using a `(marketing)` route group
- Redirect authenticated users to `/dashboard`
- Navbar: sticky, scrolled background/border, Sign In + Get Started CTAs
- Hero: headline, two CTAs, Chaos→Order visual with animated `ChaosArena` client component and static mini dashboard preview
- Features Grid: 6 cards with item type icons and colors
- AI Section: Pro badge, checklist, static code editor mockup
- Pricing: monthly/yearly toggle (`PricingToggle` client component), Free + Pro cards
- Bottom CTA section
- Footer: logo, 3 link columns, dynamic copyright year
- No DB queries — fully static, fast render
- Responsive (mobile single column, `lg` two-column hero), dark background matching app

## Notes

- Route: `src/app/(marketing)/page.tsx` with `src/app/(marketing)/layout.tsx` (no sidebar/topbar)
- Components live in `src/components/marketing/`
- Client components: `NavBar`, `ChaosArena`, `PricingToggle` (and small `HeroScroll` for smooth scroll)
- Server components: `HeroSection`, `FeaturesSection`, `AISection`, `PricingSection`, `CTASection`, `Footer`
- Logo SVG from `prototypes/homepage/logo.svg`
- `ChaosArena` animation: CSS keyframes in `globals.css` (not heavy JS)
- Pricing: Free $0 / Pro $8/mo monthly; Free $0 / Pro $6/mo ($72/yr, save 25%) yearly
- Fade-in on scroll: one reusable `FadeIn` client wrapper using `IntersectionObserver`
- Footer links use placeholder `href="#"` for unbuilt pages
- Authenticated redirect via `auth()` from NextAuth in `page.tsx`
- Tailwind CSS v4 + ShadCN `Button` for CTAs
- Based on prototype at `prototypes/homepage/`

## History

See [context/feature-history.md](feature-history.md) for the full archive of completed features.

- Homepage Mockup: standalone marketing prototype at prototypes/homepage/; dark theme; animated chaos-to-order hero with bouncing SVG icons; features grid with DevStash item type colors and Lucide icons; AI section; pricing toggle; isometric box logo SVG

- Favorite Item Toggle: toggleFavoriteItem server action; Favorite button wired in ItemDrawer with useTransition optimistic UI; toast on success/error; 5 Vitest tests

- Pinned Items: toggleItemPin server action; Pin button wired in ItemDrawer with useTransition optimistic UI; pinned items sort to top of type and collection listings; static pin icon on ItemCard; 5 Vitest tests
