# Current Feature: Stripe Phase 2 — Webhooks, Gating & UI

## Status

In Progress

## Goals

- Add Zod `CheckoutSchema` to `src/lib/validations/stripe.ts`
- Create `POST /api/stripe/checkout` — creates Stripe checkout session, persists customer ID, returns redirect URL
- Create `POST /api/stripe/portal` — creates billing portal session, returns redirect URL
- Create `POST /api/webhooks/stripe` — verifies signature, handles `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
- Build `BillingSection` client component with free/pro states and upgrade buttons
- Update `src/app/settings/page.tsx` to fetch `isPro` from DB and render `BillingSection`
- Build passes with no type errors
- End-to-end checkout flow works with Stripe test card

## Notes

- Requires Phase 1 complete (isPro in session, limit checks, Stripe singleton)
- Webhook handler must be an API route (not Server Action) to return specific HTTP status codes
- Verify webhook signature with `stripe.webhooks.constructEvent`; return 400 on failure, 200 for unhandled events
- Success URL: `${NEXT_PUBLIC_APP_URL}/settings?upgraded=true`, Cancel URL: `${NEXT_PUBLIC_APP_URL}/settings`
- Settings page must fetch `isPro` from DB (not session) for accuracy on direct page load
- Local webhook testing: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
- Stripe may deliver duplicate events; DB updates are idempotent (set fields to final state)
- `/api/upload/route.ts` needs a Pro gate for file/image uploads (same pattern as `checkItemLimit`)

## History

See [context/feature-history.md](feature-history.md) for the full archive of completed features.

- Stripe Phase 1: installed Stripe SDK; exposed isPro on NextAuth session; added free-tier item/collection limits; wired limit checks into createItem and createCollection; 10 unit tests
