# Current Feature

## Status

Completed

## History

- Project setup and boilerplate cleanup
- Initial Next.js setup with React 19, TypeScript, Tailwind CSS v4, ESLint; all package versions locked
- Dashboard Phase 1: ShadCN UI initialized (base-nova preset), /dashboard route created, dark mode by default, TopBar with branded logo, centered search with ⌘K hint, New Collection/New Item buttons, Sidebar and Main placeholders
- Dashboard Phase 2: Collapsible sidebar (DashboardShell + Sidebar components), item type nav with colored icons/counts, Favorites and All Collections sections, user avatar area, mobile overlay drawer via TopBar menu button
- Dashboard Phase 3: Stats cards (items/collections/favorites), Recent Collections with colored left accents and type-colored icons, Pinned Items with accent bars, 10 Recent Items list with type badges; mock data expanded to 10 items
- Database setup: Prisma 7 + Neon PostgreSQL; full schema (User, Item, ItemType, Collection, ItemCollection, Tag, TagsOnItems, Account, Session, VerificationToken) with indexes and cascade deletes; prisma.config.ts for CLI; src/lib/db.ts singleton via PrismaNeon adapter; .env placeholder + .env.example added
- Seed data: prisma/seed.ts populates 7 system item types, demo user (`demo@devstash.io` / 12345678, bcryptjs 12 rounds), 5 collections (React Patterns, AI Workflows, DevOps, Terminal Commands, Design Resources), and 18 items with tags; idempotent via upsert; bcryptjs 2.4.3 added
- Dashboard Collections: replaced mock data with real Prisma queries via src/lib/db/collections.ts; dominant color derived from most-used item type; per-type icons with individual colors; DashboardPage is now async server component
