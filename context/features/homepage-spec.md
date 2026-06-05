# Marketing Homepage

## Overview

Build the public-facing marketing homepage at `/` (replacing any current root redirect). The page converts visitors to sign-ups. Authenticated users are redirected to `/dashboard`.

Based on the prototype at `prototypes/homepage/`.

## Route & Auth

- Route: `src/app/(marketing)/page.tsx` with a `(marketing)` route group and shared layout
- If user is already authenticated (NextAuth session), redirect to `/dashboard`
- All sections are server components except where noted below

## Sections

### 1. Navbar — `NavBar` (client component)
- Logo (SVG from `prototypes/homepage/logo.svg`) + "DevStash" text, links to `#`
- Nav links: "Features" → `#features`, "Pricing" → `#pricing` (smooth scroll)
- Actions: "Sign In" → `/auth/signin`, "Get Started" → `/auth/signup`
- Sticky on scroll; adds background/border when scrolled (requires `useState`/`useEffect` for scroll listener)

### 2. Hero — `HeroSection` (server component)
- Eyebrow label, headline, subheadline, two CTA buttons
- "Get Started Free" → `/auth/signup`
- "See Features" → smooth scroll to `#features` (needs a small `HeroScroll` client component for the onClick)
- Chaos → Order visual: two boxes with arrow between them
  - Left box: animated bouncing SVG icons (Notion, GitHub, Slack, VS Code, Browser, Terminal, File, Bookmark) — extract into `ChaosArena` client component for the animation
  - Right box: mini dashboard preview (static, server-rendered — colored sidebar dots + card grid)

### 3. Features Grid — `FeaturesSection` (server component)
- Section anchor `id="features"`
- 6 feature cards in a responsive grid (2 col on md, 3 col on lg)
- Each card: icon with type color background, title, description
- Item types and colors pulled from a static `FEATURES` array constant (no DB call)

| Feature | Icon (Lucide) | Color |
|---|---|---|
| Code Snippets | `Code` | `#3b82f6` |
| AI Prompts | `Sparkles` | `#8b5cf6` |
| Commands | `Terminal` | `#f97316` |
| Notes | `FileText` | `#fde047` |
| Files & Images | `File` | `#6b7280` |
| Links | `Link` | `#10b981` |

### 4. AI Section — `AISection` (server component)
- "Pro Feature" badge, headline, description, checklist of 4 AI features
- Static code editor mockup (pre-rendered HTML with syntax-highlighted `useDebounce.ts` example)
- AI-generated tags row beneath the editor

### 5. Pricing — `PricingSection` (server component + `PricingToggle` client component)
- Section anchor `id="pricing"`
- `PricingToggle`: monthly/yearly switch using `useState`; passes billing period down via props or uses a shared state at the section level — keep it self-contained
- Monthly: Free $0 / Pro $8/mo. Yearly: Free $0 / Pro $6/mo ($72/yr, save 25%)
- Free card CTA → `/auth/signup`. Pro card CTA → `/auth/signup` (Stripe not wired yet)
- Pro card has "Most Popular" badge and highlighted border

### 6. Bottom CTA — `CTASection` (server component)
- Headline, subheadline, "Get Started Free" button → `/auth/signup`

### 7. Footer — `Footer` (server component)
- Logo + tagline
- 3 link columns: Product (Features, Pricing), Resources (placeholder `#` links), Legal (placeholder `#` links)
- Copyright line with dynamic year — use `new Date().getFullYear()` server-side (no client component needed)

## File Structure

```
src/app/(marketing)/
  layout.tsx          # minimal shell, no sidebar/topbar
  page.tsx            # assembles all sections
src/components/marketing/
  NavBar.tsx          # client
  HeroSection.tsx     # server
  ChaosArena.tsx      # client (animation)
  FeaturesSection.tsx # server
  AISection.tsx       # server
  PricingSection.tsx  # server wrapper
  PricingToggle.tsx   # client
  CTASection.tsx      # server
  Footer.tsx          # server
```

## Styling

- Tailwind CSS v4 + ShadCN `Button` component for CTA buttons
- Dark background (`bg-background`) matching the rest of the app
- Type colors defined as inline styles or CSS vars matching project-overview item type colors
- Fade-in on scroll: use Tailwind's `animate-` utilities or a simple `IntersectionObserver` in a `FadeIn` client wrapper — keep it minimal, one reusable wrapper is enough
- Responsive: single column mobile, two-column hero on `lg`

## Notes

- No DB queries on this page — fully static, fast render
- Keep `ChaosArena` animation CSS-based (keyframes in `globals.css`) to avoid heavy JS
- Footer link columns use placeholder `href="#"` for Changelog, Roadmap, Docs, Blog, Status, GitHub, Privacy, Terms, Security — fill in when those pages exist
- Authenticated redirect should happen in `page.tsx` using `auth()` from NextAuth before rendering anything
