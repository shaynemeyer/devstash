# Prisma 7: New Features & Breaking Changes from v6

## New Features

1. **`prisma.config.ts`** — Database URLs now live in a separate config file using `defineConfig()` from `@prisma/config`, not in `schema.prisma`.
2. **Driver Adapters** — New architecture (e.g., `@prisma/adapter-pg`) eliminates native binaries and `binaryTargets`. Better for serverless/edge.
3. **Updated Client Import Path** — Generated client now imports from `./generated/prisma/client`.

---

## Breaking Changes

1. **`schema.prisma` datasource no longer accepts `url`** — Only `provider` stays; URL moves to `prisma.config.ts`.
2. **`prisma migrate deploy` drops `--url` flag** — URL is read from config file automatically.
3. **Connection URL must use `env()` from `@prisma/config`**, not inline env strings in schema.

---

## Migration from v6 to v7

### 1. Create `prisma.config.ts`

```typescript
import { defineConfig, env } from '@prisma/config'
import 'dotenv/config'

export default defineConfig({
  datasource: {
    url: env('DATABASE_URL'),
  }
})
```

### 2. Update `schema.prisma`

Remove `url` from the datasource block — keep only `provider`:

```prisma
datasource db {
  provider = "postgresql"
}
```

### 3. Update PrismaClient initialization (if using driver adapters)

```typescript
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from './generated/prisma/client'

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
})
```

### 4. Update deployment scripts

Remove `--url` flags from any `prisma migrate deploy` commands. Ensure `prisma.config.ts` is present in production.

### 5. Install a driver adapter if needed

```bash
npm install @prisma/adapter-pg  # for PostgreSQL
```
