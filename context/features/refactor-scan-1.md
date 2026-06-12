# Refactor: Actions Shared Utilities

## Status

Not Started

## Goals

Extract repeated boilerplate from `src/actions/` into a shared `src/lib/action-utils.ts` helper file, reducing duplication across 5 action files.

## Scope

### Files Affected

- `src/actions/items.ts`
- `src/actions/collections.ts`
- `src/actions/ai.ts`
- `src/actions/settings.ts`
- `src/actions/search.ts`
- `src/lib/action-utils.ts` ← new file

---

## Implementation Plan

### Step 1 — Create `src/lib/action-utils.ts`

Add the following exports. This file must NOT have `"use server"` — it is a plain utility module imported by server action files.

```ts
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { aiLimiter, checkRateLimit } from "@/lib/rate-limit";
import { z } from "zod";

export class ActionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ActionError";
  }
}

export async function requireAuth(): Promise<{ userId: string }> {
  const session = await auth();
  if (!session?.user?.id) throw new ActionError("Unauthorized");
  return { userId: session.user.id };
}

export function parseInput<T>(schema: z.ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new ActionError(result.error.issues[0]?.message ?? "Validation failed");
  }
  return result.data;
}

export async function requireProWithRateLimit(
  userId: string,
  feature: string
): Promise<void> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isPro: true },
  });
  if (!user?.isPro) throw new ActionError("AI features require a Pro subscription.");
  const allowed = await checkRateLimit(aiLimiter, `ai:${userId}`);
  if (!allowed) {
    throw new ActionError(
      `Rate limit reached. You can ${feature} up to 20 times per hour.`
    );
  }
}

export async function withAction<T>(
  fn: () => Promise<T>
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const data = await fn();
    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      error: err instanceof ActionError ? err.message : "An unexpected error occurred.",
    };
  }
}
```

---

### Step 2 — Refactor `src/actions/ai.ts`

This file has the most duplication (auth + Pro check + rate limit × 4 functions).

For each of `generateAutoTags`, `generateDescription`, `explainCode`, `optimizePrompt`:

- Replace the manual `auth()` + `isPro` + `checkRateLimit` block with `requireAuth()` + `requireProWithRateLimit()`
- Replace `.safeParse()` blocks with `parseInput()`
- Wrap the function body in `withAction()`

**Before (per function, ~15 lines of preamble):**
```ts
const session = await auth();
if (!session?.user?.id) return { success: false, error: "Unauthorized" };
const user = await db.user.findUnique({ where: { id: session.user.id }, select: { isPro: true } });
if (!user?.isPro) return { success: false, error: "AI features require a Pro subscription." };
const allowed = await checkRateLimit(aiLimiter, `ai:${session.user.id}`);
if (!allowed) return { success: false, error: "Rate limit reached. ..." };
const result = SomeSchema.safeParse(input);
if (!result.success) return { success: false, error: result.error.issues[0].message };
```

**After:**
```ts
return withAction(async () => {
  const { userId } = await requireAuth();
  await requireProWithRateLimit(userId, "generate tags");
  const data = parseInput(SomeSchema, input);
  // ... business logic
  return result;
});
```

---

### Step 3 — Refactor `src/actions/items.ts`

- Replace `auth()` + unauthorized check with `requireAuth()`
- Replace `.safeParse()` blocks with `parseInput()`
- Wrap each exported function body in `withAction()`

---

### Step 4 — Refactor `src/actions/collections.ts`

Same as Step 3.

---

### Step 5 — Refactor `src/actions/settings.ts`

Same as Step 3.

---

### Step 6 — Refactor `src/actions/search.ts`

- Replace `auth()` + unauthorized check with `requireAuth()`
- No Zod validation in this file — skip `parseInput`
- Wrap in `withAction()` if applicable

---

### Step 7 — Verify

- Run `npm run build` — must pass with no type errors
- Smoke-test create/edit/delete item, collection, and one AI action in the browser
- Run `npm run test:run` if unit tests exist for actions

---

## Notes

- `action-utils.ts` (not `actions.ts`) avoids name collision with any future barrel export
- `withAction` always returns `{ success, data?, error? }` — matches the existing return shape used by all callers, so no client-side changes needed
- The `data` field on error branches will be `undefined`, matching current behavior
- `requireProWithRateLimit` lives here rather than in `ai.ts` because future non-AI Pro features may reuse it
