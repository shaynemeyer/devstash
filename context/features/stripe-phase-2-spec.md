# Stripe Integration — Phase 2: Webhooks, Gating & UI

## Overview

Wire up the Stripe checkout flow, customer portal, webhook handler, and billing UI in the settings page. Requires Phase 1 complete. Local testing requires the Stripe CLI for webhook forwarding.

## Prerequisites

- Phase 1 complete (`isPro` in session, limit checks active, Stripe singleton available)
- Stripe account with product + two prices created (monthly + yearly)
- Stripe CLI installed locally for webhook testing

---

## Stripe Dashboard Setup (one-time)

### 1. Create the product

- Name: **DevStash Pro**
- Add two recurring prices:
  - Monthly: $8.00 / month → copy `price_...` into `STRIPE_PRICE_MONTHLY`
  - Yearly: $72.00 / year → copy `price_...` into `STRIPE_PRICE_YEARLY`

### 2. Create a webhook endpoint

- URL: `https://your-domain.com/api/webhooks/stripe`
- Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
- Copy signing secret into `STRIPE_WEBHOOK_SECRET`

### 3. Enable Customer Portal

Stripe Dashboard → Billing → Customer portal → Activate.
Enable: Cancel subscription, Update payment method.

### 4. Local webhook testing

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Use the outputted `whsec_...` as `STRIPE_WEBHOOK_SECRET` while developing locally.

---

## Implementation Steps

### 1. Zod validation — `src/lib/validations/stripe.ts`

```typescript
export const CheckoutSchema = z.object({
  plan: z.enum(["monthly", "yearly"]),
});
```

### 2. Checkout route — `src/app/api/stripe/checkout/route.ts`

`POST` handler:
- Auth check
- Parse + validate body with `CheckoutSchema`
- Look up user's `stripeCustomerId`; create Stripe customer if absent, persist to DB
- Select price ID from `plan` → env var
- Create Checkout Session (`mode: "subscription"`, `metadata: { userId }`)
- Return `{ url }` for the client to redirect to

Success URL: `${NEXT_PUBLIC_APP_URL}/settings?upgraded=true`
Cancel URL: `${NEXT_PUBLIC_APP_URL}/settings`

### 3. Portal route — `src/app/api/stripe/portal/route.ts`

`POST` handler:
- Auth check
- Look up user's `stripeCustomerId`; return 400 if absent
- Create billing portal session
- Return `{ url }` for the client to redirect to

Return URL: `${NEXT_PUBLIC_APP_URL}/settings`

### 4. Webhook handler — `src/app/api/webhooks/stripe/route.ts`

`POST` handler — **must** be an API route (not a Server Action) to return specific HTTP status codes.

Events handled:

| Event | DB update |
|-------|-----------|
| `checkout.session.completed` | Set `isPro: true`, save `stripeSubscriptionId` |
| `customer.subscription.updated` | Set `isPro` based on `active`/`trialing` status |
| `customer.subscription.deleted` | Set `isPro: false`, clear `stripeSubscriptionId` |

- Verify signature with `stripe.webhooks.constructEvent`; return 400 on failure
- Ignore events not in the relevant set (return 200 `{ received: true }`)
- Return 500 only on DB write failure; always return 200 for unhandled events so Stripe doesn't retry

### 5. Billing UI — `src/components/settings/BillingSection.tsx`

Client component; receives `isPro: boolean` prop.

**Free state:** heading, feature summary, two buttons — "$8 / month" and "$72 / year (25% off)" — each calls `/api/stripe/checkout` and redirects to the returned URL.

**Pro state:** "Pro" badge, description, "Manage Billing" button that calls `/api/stripe/portal`.

Both states disable the button while the fetch is in flight. Toast on error.

### 6. Settings page — `src/app/settings/page.tsx`

- Fetch `isPro` directly from DB (not session) to ensure accuracy on direct page load
- Render `<BillingSection isPro={user.isPro} />` in a new "Billing" card section

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/app/api/stripe/checkout/route.ts` | Checkout session creation |
| `src/app/api/stripe/portal/route.ts` | Customer portal redirect |
| `src/app/api/webhooks/stripe/route.ts` | Webhook event handler |
| `src/components/settings/BillingSection.tsx` | Billing UI component |

## Files to Modify

| File | Change |
|------|--------|
| `src/lib/validations/stripe.ts` | Add `CheckoutSchema` |
| `src/app/settings/page.tsx` | Add DB `isPro` fetch + render `BillingSection` |

---

## Testing

### Requires Stripe CLI

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

### Manual browser test checklist

- [ ] Free user: create 50 items → 51st blocked with error toast
- [ ] Free user: create 3 collections → 4th blocked with error toast
- [ ] Click "$8 / month" → redirected to Stripe Checkout
- [ ] Complete checkout with test card `4242 4242 4242 4242` → redirected to `/settings?upgraded=true`
- [ ] Reload settings → plan badge shows "Pro"
- [ ] Click "Manage Billing" → redirected to Stripe Customer Portal
- [ ] Cancel subscription via portal → `isPro` becomes `false` after next page load
- [ ] Webhook with tampered signature → returns 400

### Stripe test cards

| Scenario | Card |
|----------|------|
| Success | 4242 4242 4242 4242 |
| Requires authentication | 4000 0025 0000 3155 |
| Declined | 4000 0000 0000 9995 |

---

## Notes

### Webhook idempotency

Stripe may deliver the same event more than once. The DB updates (`isPro`, `stripeSubscriptionId`) are safe to retry because they set fields to their correct final state. If stronger idempotency is needed later, store processed event IDs in a dedicated table.

### Session sync

After checkout, a page reload is sufficient to pick up Pro status. The JWT callback (Phase 1) always fetches `isPro` from the DB, so no client-side polling or session mutation is needed.

### File/image upload gating

`/api/upload/route.ts` currently has no Pro check. When adding the gate, verify `isPro` before accepting file/image uploads — the same DB query pattern used in `checkItemLimit` applies.

---

## Acceptance Criteria

- [ ] `npm run build` passes with no type errors
- [ ] Checkout flow completes end-to-end with test card
- [ ] `isPro` flips to `true` in DB after `checkout.session.completed` webhook fires
- [ ] Settings page shows "Pro" badge after reload
- [ ] Cancellation via portal sets `isPro: false` after `customer.subscription.deleted` fires
- [ ] Invalid webhook signature returns 400
