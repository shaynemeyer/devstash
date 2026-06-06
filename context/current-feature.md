# Current Feature: Stripe Phase 1 — Core Infrastructure

## Status

In Progress

## Goals

- Stripe SDK installed with locked versions
- `isPro` exposed on the NextAuth session
- Free-tier limits enforced on item and collection creation
- Unit tests covering all limit-check logic

## Notes

No Stripe API calls in this phase — no payments, no webhooks, no UI. Fully unit-testable without a Stripe account.

**Files to create:**

- `src/lib/stripe.ts` — Stripe singleton
- `src/lib/subscription.ts` — `checkItemLimit`, `checkCollectionLimit`
- `src/lib/validations/stripe.ts` — Zod schemas (for Phase 2)
- `src/lib/subscription.test.ts` — 8 Vitest unit tests

**Files to modify:**

- `src/types/next-auth.d.ts` — Add `isPro: boolean` to `Session.user`
- `src/auth.ts` — Extend JWT/session callbacks to sync `isPro`
- `src/lib/constants.ts` — Add `FREE_TIER_ITEM_LIMIT`, `FREE_TIER_COLLECTION_LIMIT`
- `src/actions/items.ts` — Add `checkItemLimit` call in `createItem`
- `src/actions/collections.ts` — Add `checkCollectionLimit` call in `createCollection`
- `.env` / `.env.example` — Add Stripe env vars
- `package.json` — Add `stripe`, `@stripe/stripe-js` at exact versions

**Acceptance Criteria:**

- `npm run build` passes with no type errors
- `npm run test:run` passes all 8 new subscription tests
- Free user hitting item 51 gets `{ success: false, error: "..." }`
- Free user hitting collection 4 gets `{ success: false, error: "..." }`
- Pro user never blocked by limit checks
- Session includes `isPro` on `session.user` after reload

## History

See [context/feature-history.md](feature-history.md) for the full archive of completed features.

- Homepage Cleanup: extracted shared constants; added aria roles to SVG logos and ChaosArena icons; replaced inline styles with Tailwind classes; used cn() in FadeIn
- Marketing Homepage: public-facing `/` route with NavBar, Hero/ChaosArena, FeaturesSection, AISection, PricingSection, CTASection, Footer; fully static
- Small UI Updates: added marketing NavBar to /sign-in and /register pages; replaced TopBar "S" placeholder with SVG polygon logo and gradient wordmark
