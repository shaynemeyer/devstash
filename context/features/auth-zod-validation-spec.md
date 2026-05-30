# Auth Route Zod Validation

## Overview

Replace ad-hoc if-statement validation in auth API routes with Zod schemas. Identified in the auth security audit as a High severity issue.

## Requirements

- Install `zod` as an exact version dependency (no `^`)
- Define one Zod schema per route in a shared `src/lib/validations/auth.ts` file
- Replace manual field checks and length checks in all four routes with `.safeParse()`
- Return consistent `{ error: "..." }` responses on validation failure (status 400), matching the existing pattern
- Do not add Zod to client components — server-side only

## Routes to Update

| Route | Schema Name | Fields |
| --- | --- | --- |
| `src/app/api/auth/register/route.ts` | `RegisterSchema` | `name` (optional string), `email` (email), `password` (min 8), `confirmPassword` (min 8) |
| `src/app/api/auth/forgot-password/route.ts` | `ForgotPasswordSchema` | `email` (email) |
| `src/app/api/auth/reset-password/route.ts` | `ResetPasswordSchema` | `token` (string), `password` (min 8), `confirmPassword` (min 8) |
| `src/app/api/profile/change-password/route.ts` | `ChangePasswordSchema` | `currentPassword` (string), `newPassword` (min 8), `confirmPassword` (min 8) |

## Notes

- Use `.safeParse()` (not `.parse()`) so validation errors can be returned as 400 responses without throwing
- Extract the first Zod error message with `result.error.errors[0].message` for user-friendly responses
- The `confirmPassword` match check (password === confirmPassword) stays as a manual check after Zod validation — Zod's `.refine()` is acceptable but keep it simple
- Remove all manual `if (!field)` and `if (field.length < 8)` checks that Zod now covers; keep any business logic checks (e.g. duplicate email, bcrypt compare) that Zod cannot handle

## Security Issues Closed by This Feature

This feature also resolves two High severity findings from the auth security audit:

**No Password Length Validation in Registration** (`src/app/api/auth/register/route.ts` lines 9–24): No server-side minimum length check — client-side `minLength={8}` is easily bypassed. Resolved by `RegisterSchema` enforcing `password: z.string().min(8)`.

**No Password Length Validation in Password Reset** (`src/app/api/auth/reset-password/route.ts` lines 5–15): Same gap on the reset endpoint. Resolved by `ResetPasswordSchema` enforcing `password: z.string().min(8)`.

Both match the 8-character minimum already enforced in `src/app/api/profile/change-password/route.ts`.
