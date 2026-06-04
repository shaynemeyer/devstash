# Feature: User Settings Page

## Status

Not Started

## Goals

- Add a `/settings` route that is auth-protected
- Add a **Settings** link in the sidebar user-icon dropdown (alongside Profile and Sign out)
- Move the **Account actions** section from `/profile` to `/settings` — specifically:
  - Delete account (`DeleteAccountDialog`)
  - Change password (`ChangePasswordForm`, email users only)

## Scope

The profile page (`/profile`) keeps:
- Account info (avatar, name, email, member since)
- Usage stats (total items, collections, per-type counts)

The new settings page (`/settings`) contains:
- Change password (email/password users only — `profileUser.hasPassword`)
- Danger zone: Delete account

---

## Implementation Plan

### 1. Create `/settings` page

- File: `src/app/settings/page.tsx`
- Auth-protect with `auth()` redirect to `/sign-in` if no session
- Fetch `profileUser` (need `hasPassword` flag) using existing `getProfileUser`
- Fetch sidebar data (`getItemTypesWithCounts`, `getSidebarCollections`) for `DashboardShell`
- Render inside `DashboardShell` — same shell pattern as `/profile`
- Sections:
  - **Change password** — show only if `profileUser.hasPassword`; render `<ChangePasswordForm />`
  - **Danger zone** — render `<DeleteAccountDialog />`

### 2. Update `/profile` page

- Remove the `ChangePasswordForm` import, section, and render
- Remove the `DeleteAccountDialog` import, section, and render
- Remove now-unused imports (`ChangePasswordForm`, `DeleteAccountDialog`)
- Keep: account info section, usage stats section

### 3. Add Settings link to sidebar dropdown

- File: `src/components/dashboard/SidebarUserArea.tsx`
- Add `import { Settings }` from `lucide-react` (already imports `User`, `LogOut`)
- Add a `<Link href="/settings">` entry in the dropdown popover, between Profile and Sign out
- Label: **Settings**, icon: `<Settings className="size-4 text-muted-foreground" />`

---

## Files to Change

| File | Change |
|---|---|
| `src/app/settings/page.tsx` | Create — new settings page |
| `src/app/profile/page.tsx` | Remove `ChangePasswordForm` and `DeleteAccountDialog` sections |
| `src/components/dashboard/SidebarUserArea.tsx` | Add Settings link to dropdown |

## Files Unchanged

- `src/components/profile/ChangePasswordForm.tsx` — no changes
- `src/components/profile/DeleteAccountDialog.tsx` — no changes
- `src/lib/db/profile.ts` — no changes

---

## Notes

- No new DB queries needed — reuse `getProfileUser` which already returns `hasPassword`
- No migrations needed
- No new server actions needed
- Keep the same heading/section style as `/profile` for visual consistency
