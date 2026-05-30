# Current Feature: Forgot Password

## Status

In Progress

## Goals

- Add a "Forgot password?" link on the `/sign-in` page
- Create a `/forgot-password` page with an email input form
- `POST /api/auth/forgot-password` — look up user by email, create a `VerificationToken` record with a reset token (1hr expiry), send a reset link via Resend
- Create a `/reset-password?token=...` page with new-password / confirm-password fields
- `POST /api/auth/reset-password` — validate token (exists, not expired), hash and update user's password, delete the token, redirect to `/sign-in` with a success toast
- Block password reset for OAuth-only accounts (no password field set)
- Reuse existing `VerificationToken` model — no schema changes needed

## Notes

- Use the existing `VerificationToken` model (`identifier`, `token`, `expires`)
- Use `identifier` = user email, `token` = random UUID or crypto token
- Reuse `src/lib/email.ts` for sending the reset email (add a new `sendPasswordResetEmail` function)
- Keep consistent with existing auth UI style (`/sign-in`, `/register`)
- `EMAIL_VERIFICATION_ENABLED` flag does NOT gate this feature — password reset should always work
- Token expiry: 1 hour (shorter than email verification's 24hr)

## History

- Project setup and boilerplate cleanup
- Initial Next.js setup with React 19, TypeScript, Tailwind CSS v4, ESLint; all package versions locked
- Dashboard Phase 1: ShadCN UI initialized (base-nova preset), /dashboard route created, dark mode by default, TopBar with branded logo, centered search with ⌘K hint, New Collection/New Item buttons, Sidebar and Main placeholders
- Dashboard Phase 2: Collapsible sidebar (DashboardShell + Sidebar components), item type nav with colored icons/counts, Favorites and All Collections sections, user avatar area, mobile overlay drawer via TopBar menu button
- Dashboard Phase 3: Stats cards (items/collections/favorites), Recent Collections with colored left accents and type-colored icons, Pinned Items with accent bars, 10 Recent Items list with type badges; mock data expanded to 10 items
- Database setup: Prisma 7 + Neon PostgreSQL; full schema (User, Item, ItemType, Collection, ItemCollection, Tag, TagsOnItems, Account, Session, VerificationToken) with indexes and cascade deletes; prisma.config.ts for CLI; src/lib/db.ts singleton via PrismaNeon adapter; .env placeholder + .env.example added
- Seed data: prisma/seed.ts populates 7 system item types, demo user (`demo@devstash.io` / 12345678, bcryptjs 12 rounds), 5 collections (React Patterns, AI Workflows, DevOps, Terminal Commands, Design Resources), and 18 items with tags; idempotent via upsert; bcryptjs 2.4.3 added
- Dashboard Collections: replaced mock data with real Prisma queries via src/lib/db/collections.ts; dominant color derived from most-used item type; per-type icons with individual colors; DashboardPage is now async server component
- Dashboard Items: replaced mock item data with real Prisma queries via src/lib/db/items.ts; getPinnedItems, getRecentItems, getDashboardStats fetched in parallel; PinnedItems hidden when empty; StatsCards, PinnedItems, RecentItems updated to accept real data as props
- Stats & Sidebar: replaced all mock-data in Sidebar with real Prisma queries; getItemTypesWithCounts (items.ts) and getSidebarCollections (collections.ts) added; DashboardShell accepts itemTypes/collections props; sidebar shows live type counts linking to /items/[slug], favorites with stars, recents with dominant-color circles, and "View all collections" link to /collections
- Add Pro Badge to Sidebar: ShadCN Badge component added; Files and Images item types in the sidebar now show a subtle outline PRO badge; badge hidden when sidebar is collapsed
- Code Quality Quick Wins: Prisma include → select on type/tag relations in items.ts and collections.ts; try/catch with safe fallbacks added to all async DB functions; shared getIcon() utility extracted to src/lib/icons.ts with Code as default fallback; duplicated ICON_MAP and unsafe keyof casts removed from all dashboard components
- Auth Setup: NextAuth v5 (5.0.0-beta.31) + @auth/prisma-adapter; split auth config (auth.config.ts edge-safe with GitHub provider, auth.ts with Prisma adapter + JWT strategy); API route handler at /api/auth/[...nextauth]; proxy.ts protects /dashboard/* with redirect to sign-in; Session type extended with user.id
- Auth Credentials: password field added to User via migration; Credentials provider added to auth.config.ts (edge-safe placeholder) and overridden in auth.ts with bcrypt validation; POST /api/auth/register route handles registration with duplicate/mismatch validation; seed.ts updated to store demo user password in correct field
- Auth UI: custom /sign-in page (email/password + GitHub OAuth button, link to register); custom /register page (name/email/password/confirm, validates, posts to /api/auth/register, redirects to /sign-in with success toast); reusable UserAvatar component (GitHub image or initials fallback); sidebar bottom replaced with real user avatar/name/email and a dropdown with Profile link and Sign out action; NextAuth pages config and proxy redirect both point to /sign-in; sonner 2.0.7 added with Toaster at top-right in root layout
- Email Verification on Register: resend 4.5.1 added; src/lib/email.ts sends 24hr verification link via onboarding@resend.dev; token stored in VerificationToken model; GET /api/auth/verify-email validates token, sets emailVerified, redirects to /sign-in?verified=true; unverified Credentials users blocked in authorize(); /verify-email "check your email" page added; VerifiedToast shown on sign-in after verification; scripts/purge-users.ts added to wipe all non-demo users and their content
- Email Verification Toggle Flag: EMAIL_VERIFICATION_ENABLED env var added; gates token creation/email send in /api/auth/register and the emailVerified check in authorize(); defaults to false (unset = disabled) so registration works without a Resend domain configured
