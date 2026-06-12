# UI Review

**Method**: Playwright live inspection of `/dashboard`, `/items/snippets`, `/register`, `/sign-in` + source review of relevant components.

---

## Confirmed Bugs

### 1. Sidebar: No Active Link Highlighting

**Observed via Playwright**: Navigating to `/items/snippets` — the Snippets link in the sidebar shows no active state. All links render identically regardless of the current route.

**Root cause**: `TypeNavigation.tsx` and `CollectionsList.tsx` apply only `hover:bg-sidebar-accent` with no `usePathname()` active check.

**Fix**: Add `usePathname()` to both components and apply `bg-sidebar-accent text-sidebar-foreground font-medium` when the path matches.

```tsx
// TypeNavigation.tsx
const pathname = usePathname();
// in className:
pathname === `/items/${slug}` &&
  'bg-sidebar-accent text-sidebar-foreground font-medium';
```

Same pattern for collection links in `CollectionsList.tsx`.

---

### 2. Register Page: No GitHub Button

**Observed via Playwright**: `/register` has email/password fields only. `/sign-in` has a "Sign in with GitHub" button + divider above the form.

**Root cause**: `RegisterForm.tsx` has no OAuth button. `SignInForm.tsx` does (lines 44–53).

**Fix**: Add a GitHub button to `RegisterForm.tsx` above the form, matching the sign-in layout:

```tsx
import { signIn } from "next-auth/react";
import { GitBranch } from "lucide-react";

// Above the <form>:
<Button type="button" variant="outline" className="w-full gap-2" onClick={() => signIn("github", { callbackUrl: "/dashboard" })}>
  <GitBranch className="size-4" />
  Continue with GitHub
</Button>
<div className="flex items-center gap-3">
  <div className="flex-1 border-t border-border" />
  <span className="text-xs text-muted-foreground">or</span>
  <div className="flex-1 border-t border-border" />
</div>
```

---

## Additional Observations

### 3. Favorites Link Lives in the Header, Not the Sidebar

The "Favorites" link appears in the top header bar alongside "New Collection" and "New Item" buttons. It fits better as a sidebar item (below Types, above Collections), consistent with how Linear/Notion organize navigation. Move it into `SidebarContent.tsx` as a nav link.

### 4. No Active State on Dashboard Link

There's no "Dashboard" or "Home" link in the sidebar itself — the logo is the only way to return. Adding a Dashboard nav entry to the sidebar (with active state) would be consistent with the rest of the nav structure.

### 5. Collections Sidebar: No Active State on Current Collection

When viewing `/collections/[id]`, the matching collection link in the sidebar has no highlight. Same `usePathname()` fix as item 1 applies to `CollectionsList.tsx`.

---

## Priority Order

| #   | Issue                            | Effort               |
| --- | -------------------------------- | -------------------- |
| 1   | Sidebar active link highlighting | Low                  |
| 2   | GitHub button on register page   | Low                  |
| 3   | Move Favorites into sidebar      | Low                  |
| 4   | Dashboard link in sidebar        | Low                  |
| 5   | Active collection highlight      | Low (same fix as #1) |
