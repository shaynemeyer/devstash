# Stripe Integration Plan — DevStash Pro

**Pricing:** $8/month · $72/year (25% discount)

---

## Current State Analysis

### User Model

`prisma/schema.prisma` — all required Stripe fields are already defined:

```prisma
model User {
  isPro                Boolean  @default(false)
  stripeCustomerId     String?  @unique
  stripeSubscriptionId String?  @unique
}
```

No schema migration is needed.

### NextAuth — What Needs Changing

`src/auth.ts` — the JWT callback currently syncs only `passwordChangedAt` from the database. The session callback only adds `id` to the session.

**Problem:** After a Stripe webhook sets `isPro = true`, the client session will not reflect this. The `trigger === "update"` approach in NextAuth v5 is unreliable for webhook-driven updates.

**Solution:** Extend the JWT callback to always fetch `isPro` from the database on every session validation. This costs one small DB query per request but guarantees the session stays current after a webhook fires. A page reload after checkout is sufficient to pick up Pro status.

`src/types/next-auth.d.ts` — currently only extends `Session.user` with `id`. Must add `isPro`.

### Feature Gating — Current State

- No limit checks exist anywhere in the codebase.
- `isPro` is not read by any server action, API route, or component.
- Limits are referenced only in the marketing `PricingToggle` component (display only).

### API Route Structure

Routes live under `src/app/api/`. All routes follow the same auth pattern:

```typescript
const session = await auth();
if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });
```

New Stripe routes will follow this same pattern.

### Server Action Pattern

All actions return `{ success: boolean; data?: T; error?: string }` and call `auth()` at the top. The Stripe limit-check additions will slot cleanly into this pattern.

---

## Implementation Plan

### Implementation Order

1. Install packages and add env vars
2. Extend session to include `isPro`
3. Add free-tier constants and limit-check utility
4. Add limit checks to item and collection creation
5. Create Stripe library helpers
6. Create checkout and portal API routes
7. Create webhook handler
8. Add subscription UI to settings page
9. Add upgrade prompts where limits are enforced
10. Test end-to-end

---

## Files to Create

### `src/lib/stripe.ts`

Stripe server-side client singleton.

```typescript
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
});
```

### `src/lib/validations/stripe.ts`

Zod schemas for Stripe webhook payloads and checkout requests.

```typescript
import { z } from "zod";

export const CheckoutSchema = z.object({
  plan: z.enum(["monthly", "yearly"]),
});
```

### `src/app/api/stripe/checkout/route.ts`

Creates a Stripe Checkout Session and redirects the user.

```typescript
import { auth } from "@/auth";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { CheckoutSchema } from "@/lib/validations/stripe";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const result = CheckoutSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 });
  }

  const { plan } = result.data;
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { email: true, stripeCustomerId: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Reuse existing customer or create a new one
  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({ email: user.email! });
    customerId = customer.id;
    await db.user.update({
      where: { id: session.user.id },
      data: { stripeCustomerId: customerId },
    });
  }

  const priceId =
    plan === "yearly"
      ? process.env.STRIPE_PRICE_YEARLY!
      : process.env.STRIPE_PRICE_MONTHLY!;

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    mode: "subscription",
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?upgraded=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings`,
    metadata: { userId: session.user.id },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
```

### `src/app/api/stripe/portal/route.ts`

Opens the Stripe Customer Portal for managing subscriptions.

```typescript
import { auth } from "@/auth";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { stripeCustomerId: true },
  });

  if (!user?.stripeCustomerId) {
    return NextResponse.json({ error: "No subscription found" }, { status: 400 });
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings`,
  });

  return NextResponse.json({ url: portalSession.url });
}
```

### `src/app/api/webhooks/stripe/route.ts`

Handles Stripe webhook events. Must be an API route (not a Server Action) to receive POST from Stripe and return specific HTTP status codes.

```typescript
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const RELEVANT_EVENTS = new Set([
  "checkout.session.completed",
  "customer.subscription.updated",
  "customer.subscription.deleted",
]);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (!RELEVANT_EVENTS.has(event.type)) {
    return NextResponse.json({ received: true });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const checkoutSession = event.data.object as Stripe.Checkout.Session;
        if (checkoutSession.mode === "subscription" && checkoutSession.subscription) {
          await db.user.update({
            where: { stripeCustomerId: checkoutSession.customer as string },
            data: {
              isPro: true,
              stripeSubscriptionId: checkoutSession.subscription as string,
            },
          });
        }
        break;
      }
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const isActive = ["active", "trialing"].includes(subscription.status);
        await db.user.update({
          where: { stripeCustomerId: subscription.customer as string },
          data: {
            isPro: isActive,
            stripeSubscriptionId: isActive ? subscription.id : null,
          },
        });
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await db.user.update({
          where: { stripeCustomerId: subscription.customer as string },
          data: { isPro: false, stripeSubscriptionId: null },
        });
        break;
      }
    }
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
```

### `src/lib/subscription.ts`

Reusable limit-check utilities called from server actions.

```typescript
import { db } from "@/lib/db";
import { FREE_TIER_ITEM_LIMIT, FREE_TIER_COLLECTION_LIMIT } from "@/lib/constants";

export async function checkItemLimit(userId: string): Promise<string | null> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isPro: true },
  });
  if (user?.isPro) return null;

  const count = await db.item.count({ where: { userId } });
  if (count >= FREE_TIER_ITEM_LIMIT) {
    return `Free plan is limited to ${FREE_TIER_ITEM_LIMIT} items. Upgrade to Pro for unlimited items.`;
  }
  return null;
}

export async function checkCollectionLimit(userId: string): Promise<string | null> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isPro: true },
  });
  if (user?.isPro) return null;

  const count = await db.collection.count({ where: { userId } });
  if (count >= FREE_TIER_COLLECTION_LIMIT) {
    return `Free plan is limited to ${FREE_TIER_COLLECTION_LIMIT} collections. Upgrade to Pro for unlimited collections.`;
  }
  return null;
}
```

### `src/components/settings/BillingSection.tsx`

Client component rendered inside the settings page.

```typescript
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface BillingSectionProps {
  isPro: boolean;
}

export function BillingSection({ isPro }: BillingSectionProps) {
  const [loading, setLoading] = useState(false);

  async function handleUpgrade(plan: "monthly" | "yearly") {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const { url, error } = await res.json();
      if (error) { toast.error(error); return; }
      window.location.href = url;
    } finally {
      setLoading(false);
    }
  }

  async function handleManage() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const { url, error } = await res.json();
      if (error) { toast.error(error); return; }
      window.location.href = url;
    } finally {
      setLoading(false);
    }
  }

  if (isPro) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium">Subscription</h3>
          <Badge>Pro</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          You have an active Pro subscription.
        </p>
        <Button variant="outline" onClick={handleManage} disabled={loading}>
          Manage Billing
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Upgrade to Pro</h3>
      <p className="text-sm text-muted-foreground">
        Unlimited items and collections, file uploads, AI features, and data export.
      </p>
      <div className="flex gap-3">
        <Button onClick={() => handleUpgrade("monthly")} disabled={loading}>
          $8 / month
        </Button>
        <Button variant="outline" onClick={() => handleUpgrade("yearly")} disabled={loading}>
          $72 / year <span className="ml-1 text-xs text-emerald-500">25% off</span>
        </Button>
      </div>
    </div>
  );
}
```

---

## Files to Modify

### `src/auth.ts` — Extend JWT and session callbacks

Replace the existing callbacks with:

```typescript
callbacks: {
  async jwt({ token, user }) {
    if (user) {
      token.id = user.id;
      token.sessionStart = Math.floor(Date.now() / 1000);
    }

    if (token.id) {
      const dbUser = await db.user.findUnique({
        where: { id: token.id as string },
        select: { passwordChangedAt: true, isPro: true },
      });

      // Invalidate session if password changed after token was issued
      if (dbUser?.passwordChangedAt && token.sessionStart) {
        const changedAt = Math.floor(dbUser.passwordChangedAt.getTime() / 1000);
        if ((token.sessionStart as number) < changedAt) return null;
      }

      // Always sync isPro so webhook updates are picked up on next page load
      token.isPro = dbUser?.isPro ?? false;
    }

    return token;
  },

  session({ session, token }) {
    if (token.id) session.user.id = token.id as string;
    if (typeof token.isPro === "boolean") session.user.isPro = token.isPro;
    return session;
  },
},
```

This merges the existing `passwordChangedAt` invalidation check with the new `isPro` sync into a single DB query.

### `src/types/next-auth.d.ts` — Add `isPro` to session type

```typescript
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      isPro: boolean;
    } & DefaultSession["user"];
  }
}
```

### `src/lib/constants.ts` — Add free tier limits

```typescript
export const FREE_TIER_ITEM_LIMIT = 50;
export const FREE_TIER_COLLECTION_LIMIT = 3;
```

### `src/actions/items.ts` — Add limit check before creation

At the top of `createItem`, after the auth check and before validation:

```typescript
const limitError = await checkItemLimit(session.user.id);
if (limitError) return { success: false, error: limitError };
```

### `src/actions/collections.ts` — Add limit check before creation

At the top of `createCollection`, after the auth check and before validation:

```typescript
const limitError = await checkCollectionLimit(session.user.id);
if (limitError) return { success: false, error: limitError };
```

### `src/app/settings/page.tsx` — Add BillingSection

Fetch `isPro` from the database (not session, to ensure accuracy on direct page load):

```typescript
const user = await db.user.findUnique({
  where: { id: session.user.id },
  select: { isPro: true, ... },
});
```

Render `<BillingSection isPro={user.isPro} />` in a new "Billing" card section.

---

## Package Installation

```bash
npm install stripe @stripe/stripe-js
```

Use exact versions — no `^`. Check the latest release and pin:

```json
"stripe": "17.7.0",
"@stripe/stripe-js": "5.8.0"
```

> Verify current versions at https://www.npmjs.com/package/stripe before pinning.

---

## Environment Variables

Add to `.env`:

```env
# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_MONTHLY=price_...
STRIPE_PRICE_YEARLY=price_...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

`NEXT_PUBLIC_APP_URL` must be set to the production URL in the deployment environment.

---

## Stripe Dashboard Setup

1. **Create a Product**
   - Name: DevStash Pro
   - Add two prices:
     - Monthly: $8.00 / month (recurring)
     - Yearly: $72.00 / year (recurring)
   - Copy both `price_...` IDs into env vars.

2. **Create a Webhook Endpoint**
   - URL: `https://your-domain.com/api/webhooks/stripe`
   - Events to listen for:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
   - Copy the webhook signing secret into `STRIPE_WEBHOOK_SECRET`.

3. **Enable Customer Portal**
   - Stripe Dashboard → Billing → Customer portal → Activate.
   - Enable: Cancel subscription, Update payment method.

4. **Local webhook testing**

   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

   This outputs a temporary `whsec_...` to use as `STRIPE_WEBHOOK_SECRET` locally.

---

## Testing Checklist

### Unit / Integration

- [ ] `checkItemLimit` returns `null` for Pro users regardless of count
- [ ] `checkItemLimit` returns error string when count >= 50 for free users
- [ ] `checkCollectionLimit` returns `null` for Pro users
- [ ] `checkCollectionLimit` returns error string when count >= 3 for free users
- [ ] Webhook handler ignores events not in `RELEVANT_EVENTS`
- [ ] Webhook handler rejects requests with invalid signatures

### Manual Browser Tests

- [ ] Free user: create 50 items → 51st is blocked with an error toast
- [ ] Free user: create 3 collections → 4th is blocked with an error toast
- [ ] Click "Upgrade" → redirected to Stripe Checkout
- [ ] Complete checkout with test card `4242 4242 4242 4242` → redirected to `/settings?upgraded=true`
- [ ] After checkout, reload settings → plan shows "Pro" badge
- [ ] Click "Manage Billing" → redirected to Stripe Customer Portal
- [ ] Cancel subscription via portal → `isPro` becomes `false` after next page load
- [ ] Webhook signature validation rejects tampered payloads

### Stripe Test Cards

| Scenario                | Card number         |
| ----------------------- | ------------------- |
| Success                 | 4242 4242 4242 4242 |
| Requires authentication | 4000 0025 0000 3155 |
| Declined                | 4000 0000 0000 9995 |

---

## Notes

### Session Sync Strategy

The NextAuth v5 `trigger === "update"` approach is unreliable for webhook-driven `isPro` updates. The chosen approach instead always fetches `isPro` from the database inside the JWT callback. This adds one DB query per session token refresh (roughly once per hour with the default `maxAge`, or on every request if session strategy is set to always update). A simple page reload after checkout picks up the new status with no client-side polling or session mutation required.

See `src/auth.ts` — the same `findUnique` call that already checks `passwordChangedAt` is extended to also select `isPro`, so there is no net increase in DB queries.

### Webhook Idempotency

Stripe may deliver the same webhook event more than once. The `db.user.update` calls are safe to retry because they are setting boolean/string fields to their correct final state. If stronger idempotency is needed in the future, store processed event IDs in a dedicated table.

### File/Image Upload Gating

The `/api/upload/route.ts` and `/api/files/[...key]/route.ts` routes currently have no Pro check. When implementing, add a check that the item type is `file` or `image` and that the user `isPro`. The limit check can use the same `checkItemLimit` utility.
