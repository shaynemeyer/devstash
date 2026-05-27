# Current Feature

<!-- Feature Name -->

## Seed Data

## Status

Completed

## Goals

Create `prisma/seed.ts` to populate the database with sample data for development and demos.

### User

- Email: `demo@devstash.io`, Name: `Demo User`
- Password: `12345678` (bcryptjs, 12 rounds)
- `isPro: false`, `emailVerified`: current date

### System Item Types

| Name    | Icon       | Color   |
| ------- | ---------- | ------- |
| snippet | Code       | #3b82f6 |
| prompt  | Sparkles   | #8b5cf6 |
| command | Terminal   | #f97316 |
| note    | StickyNote | #fde047 |
| file    | File       | #6b7280 |
| image   | Image      | #ec4899 |
| link    | Link       | #10b981 |

All types: `isSystem: true`. Icons are Lucide React component names.

### Collections & Items

| Collection        | Description                               | Items                                              |
| ----------------- | ----------------------------------------- | -------------------------------------------------- |
| React Patterns    | Reusable React patterns and hooks         | 3 snippets (useDebounce, context, utils)           |
| AI Workflows      | AI prompts and workflow automations       | 3 prompts (code review, docs gen, refactoring)     |
| DevOps            | Infrastructure and deployment resources   | 1 snippet, 1 command, 2 links (real URLs)          |
| Terminal Commands | Useful shell commands for everyday dev    | 4 commands (git, docker, process mgmt, pkg mgr)    |
| Design Resources  | UI/UX resources and references            | 4 links (Tailwind, component libs, design, icons)  |

## Notes

- See `context/features/seed-spec.md` for full detail on each collection and item
- Use real URLs for link items
- Run via `prisma db seed` (configured in `package.json`)
- Use `bcryptjs` for password hashing (not `bcrypt`)

## History

- Project setup and boilerplate cleanup
- Initial Next.js setup with React 19, TypeScript, Tailwind CSS v4, ESLint; all package versions locked
- Dashboard Phase 1: ShadCN UI initialized (base-nova preset), /dashboard route created, dark mode by default, TopBar with branded logo, centered search with ⌘K hint, New Collection/New Item buttons, Sidebar and Main placeholders
- Dashboard Phase 2: Collapsible sidebar (DashboardShell + Sidebar components), item type nav with colored icons/counts, Favorites and All Collections sections, user avatar area, mobile overlay drawer via TopBar menu button
- Dashboard Phase 3: Stats cards (items/collections/favorites), Recent Collections with colored left accents and type-colored icons, Pinned Items with accent bars, 10 Recent Items list with type badges; mock data expanded to 10 items
- Database setup: Prisma 7 + Neon PostgreSQL; full schema (User, Item, ItemType, Collection, ItemCollection, Tag, TagsOnItems, Account, Session, VerificationToken) with indexes and cascade deletes; prisma.config.ts for CLI; src/lib/db.ts singleton via PrismaNeon adapter; .env placeholder + .env.example added
- Seed data: prisma/seed.ts populates 7 system item types, demo user (`demo@devstash.io` / 12345678, bcryptjs 12 rounds), 5 collections (React Patterns, AI Workflows, DevOps, Terminal Commands, Design Resources), and 18 items with tags; idempotent via upsert; bcryptjs 2.4.3 added
