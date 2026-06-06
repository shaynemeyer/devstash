# Current Feature

## Status

Not Started

## Goals

## Notes

## History

See [context/feature-history.md](feature-history.md) for the full archive of completed features.

- Stripe Phase 1: installed Stripe SDK; exposed isPro on NextAuth session; added free-tier item/collection limits; wired limit checks into createItem and createCollection; 10 unit tests
- Stripe Phase 2: checkout session route, customer portal route, webhook handler (signature verification + 3 event types), BillingSection component (free/pro states), settings page DB isPro fetch; 5 unit tests
