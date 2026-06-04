# Audit Quick Wins

## Status

In Progress

## Goals

Apply four quick-win fixes identified in the code audit:

1. **Demo user deletion guard** — Block `demo@devstash.io` from being deleted via the delete-account API route
2. **`formatBytes` deduplication** — Remove duplicate implementations in `FileUpload.tsx` and `ItemDrawer.tsx`; import from `utils.ts`
3. **`typeName` enum validation** — Change `typeName` in `CreateItemSchema` from `z.string().min(1)` to `z.enum([...])` with all valid system types
4. **Verify-email token validation** — Validate the token query param with `z.uuid()` in the verify-email route before hitting the DB

## Notes

- No schema or migration changes required
- No new dependencies added
- All changes confined to existing files
- `UpdateItemSchema` has no `typeName` field — enum fix applies to `CreateItemSchema` only
- `z.uuid()` used (not `z.string().uuid()`) — Zod v4 standalone validator

## Changes

### `src/app/api/profile/delete-account/route.ts`

Added a guard before the `db.user.delete` call:

```ts
if (session.user.email === "demo@devstash.io") {
  return NextResponse.json({ error: "Cannot delete the demo account" }, { status: 403 });
}
```

Prevents the shared demo account from being wiped by anyone who signs in with the demo credentials.

### `src/lib/validations/items.ts`

Changed `typeName` field in `CreateItemSchema`:

```ts
// before
typeName: z.string().min(1),

// after
typeName: z.enum(["Snippet", "Prompt", "Command", "Note", "Link", "File", "Image"]),
```

Ensures only valid system type names can reach the type-specific validation logic in `superRefine`.

### `src/app/api/auth/verify-email/route.ts`

Added UUID validation on the token query param before the DB lookup:

```ts
const TokenSchema = z.uuid()

const raw = searchParams.get("token")
const result = TokenSchema.safeParse(raw)

if (!result.success) {
  return NextResponse.redirect(new URL("/sign-in?error=invalid-token", request.url))
}

const token = result.data
```

Rejects malformed tokens immediately without touching the database.

### `src/components/ui/FileUpload.tsx` and `src/components/items/ItemDrawer.tsx`

Removed the local `formatBytes` function from both files and replaced with an import from `src/lib/utils.ts`, where it already lives with full test coverage.

```ts
import { formatBytes } from "@/lib/utils";
```
