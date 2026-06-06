# Stripe Integration — Phase 1: Core Infrastructure

## Overview

Install the Stripe SDK, extend the session with `isPro`, add free-tier limit constants and enforcement utilities, and wire limit checks into item and collection creation. No Stripe API calls in this phase — no payments, no webhooks, no UI. Phase 1 is fully unit-testable without a Stripe account.

## Goals

- Stripe SDK installed with locked versions
- `isPro` exposed on the NextAuth session
- Free-tier limits enforced on item and collection creation
- Unit tests covering all limit-check logic

## Out of Scope (Phase 2)

- Stripe checkout and portal API routes
- Webhook handler
- Billing UI in settings
- Upgrade prompts

---

## Implementation Steps

### 1. Install packages

```bash
npm install stripe@17.7.0 @stripe/stripe-js@5.8.0
```

Verify current versions at https://www.npmjs.com/package/stripe before pinning.

### 2. Environment variables

Add to `.env` and `.env.example`:

```env
# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_MONTHLY=price_...
STRIPE_PRICE_YEARLY=price_...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Stripe singleton — `src/lib/stripe.ts`

```typescript
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
});
```

### 4. Extend session type — `src/types/next-auth.d.ts`

Add `isPro: boolean` to `Session.user`.

### 5. Extend JWT and session callbacks — `src/auth.ts`

Merge the existing `passwordChangedAt` invalidation check with `isPro` sync in a single `db.user.findUnique` call:

```typescript
select: { passwordChangedAt: true, isPro: true }
```

Always write `token.isPro` from the DB so a page reload after a webhook fires picks up the new status. Extend the `session` callback to propagate `isPro` onto `session.user`.

### 6. Free-tier constants — `src/lib/constants.ts`

```typescript
export const FREE_TIER_ITEM_LIMIT = 50;
export const FREE_TIER_COLLECTION_LIMIT = 3;
```

### 7. Limit-check utilities — `src/lib/subscription.ts`

```typescript
export async function checkItemLimit(userId: string): Promise<string | null>;
export async function checkCollectionLimit(
  userId: string,
): Promise<string | null>;
```

- Returns `null` for Pro users immediately (no count query).
- Returns an error string when count >= limit for free users.

### 8. Wire limit checks into server actions

`src/actions/items.ts` — add at the top of `createItem`, after the auth check:

```typescript
const limitError = await checkItemLimit(session.user.id);
if (limitError) return { success: false, error: limitError };
```

`src/actions/collections.ts` — same pattern in `createCollection`.

---

## Files to Create

| File                            | Purpose                                  |
| ------------------------------- | ---------------------------------------- |
| `src/lib/stripe.ts`             | Stripe singleton                         |
| `src/lib/subscription.ts`       | `checkItemLimit`, `checkCollectionLimit` |
| `src/lib/validations/stripe.ts` | Zod schemas (CheckoutSchema for Phase 2) |

## Files to Modify

| File                         | Change                                                   |
| ---------------------------- | -------------------------------------------------------- |
| `src/types/next-auth.d.ts`   | Add `isPro: boolean` to `Session.user`                   |
| `src/auth.ts`                | Extend JWT/session callbacks to sync `isPro`             |
| `src/lib/constants.ts`       | Add `FREE_TIER_ITEM_LIMIT`, `FREE_TIER_COLLECTION_LIMIT` |
| `src/actions/items.ts`       | Add `checkItemLimit` call in `createItem`                |
| `src/actions/collections.ts` | Add `checkCollectionLimit` call in `createCollection`    |
| `.env` / `.env.example`      | Add Stripe env vars                                      |
| `package.json`               | Add `stripe`, `@stripe/stripe-js` at exact versions      |

---

## Unit Tests — `src/lib/subscription.test.ts`

All tests use Vitest with the Prisma client mocked.

| Test                                                           | Expected             |
| -------------------------------------------------------------- | -------------------- |
| `checkItemLimit` — Pro user, 100 items                         | returns `null`       |
| `checkItemLimit` — free user, 49 items                         | returns `null`       |
| `checkItemLimit` — free user, 50 items (at limit)              | returns error string |
| `checkItemLimit` — free user, 51 items (over limit)            | returns error string |
| `checkCollectionLimit` — Pro user, 10 collections              | returns `null`       |
| `checkCollectionLimit` — free user, 2 collections              | returns `null`       |
| `checkCollectionLimit` — free user, 3 collections (at limit)   | returns error string |
| `checkCollectionLimit` — free user, 4 collections (over limit) | returns error string |

---

## Acceptance Criteria

- [ ] `npm run build` passes with no type errors
- [ ] `npm run test:run` passes all 8 new subscription tests
- [ ] Free user attempting to create item 51 gets `{ success: false, error: "..." }`
- [ ] Free user attempting to create collection 4 gets `{ success: false, error: "..." }`
- [ ] Pro user (`isPro: true` in DB) is never blocked by limit checks
- [ ] Session includes `isPro` on `session.user` after reload
