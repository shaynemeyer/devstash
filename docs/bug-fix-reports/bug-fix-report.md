# Bug Fix Report — useEffect Cleanup

**Date:** 2026-06-07  
**Branch:** main (uncommitted changes)

---

## Summary

A code review identified three bugs introduced by a refactor that removed several `useEffect` hooks from components and hooks across the codebase. The fixes were verified manually with Playwright.

---

## Bug 1 — MarkdownEditor: write tab not accessible in edit mode

**File:** `src/components/ui/MarkdownEditor.tsx`

**Problem:** The `tab` state (`"write"` | `"preview"`) was initialised once from the `readOnly` prop via `useState`. The refactor removed the `useEffect` that synced `tab` when `readOnly` changed. `MarkdownEditor` is not remounted when the user toggles edit mode — the same instance stays mounted and `readOnly` flips from `true` → `false`. Without the sync, `tab` stayed on `"preview"` and the textarea never rendered, making all text-type items (prompts, notes, snippets) uneditable.

**Fix:** Restored the `useEffect` that calls `setTab(readOnly ? "preview" : "write")` on `[readOnly]`. The `useState` initialiser only runs on mount; a `useEffect` is required to sync derived state when a prop changes on an already-mounted component.

**Verified:** Opened a prompt in view mode (showed preview), clicked Edit → MarkdownEditor immediately switched to the Write tab with an editable textarea.

---

## Bug 2 — EditorPreferencesContext: async-loaded preferences ignored

**File:** `src/contexts/EditorPreferencesContext.tsx`

**Problem:** `DashboardShell` fetches editor preferences asynchronously — the provider initially mounts with `initialPreferences=null` (triggering `DEFAULT_EDITOR_PREFERENCES`), then re-renders once the fetch completes with the real values. The refactor removed the `useEffect` that synced `initialPreferences` prop changes into state. Without it, the provider's state was frozen at defaults. Users who reached the settings page before the async fetch resolved would see — and potentially save — default values over their actual preferences.

**Fix:** Restored the `useEffect` that calls `setPreferences(initialPreferences)` on `[initialPreferences]`. Same reasoning as Bug 1: `useState` initialiser does not re-run on prop updates.

**Verified:** Changed font size to 16, reloaded the page — value persisted as 16 (not reverted to the default of 13), confirming the async load propagated into context state correctly.

---

## Bug 3 — CreateItemDrawer: setState on unmounted component

**File:** `src/components/items/CreateItemDrawer.tsx`

**Problem:** `getUserCollections()` fired on mount with no cleanup. If the user opened and immediately closed the drawer (unmounting `DrawerContent` via the `{open && ...}` guard) before the promise resolved, `setCollections` would be called on an unmounted component, producing a React memory-leak warning.

**Fix:** Added a `cancelled` boolean flag as a cancellation token in the `useEffect` cleanup. The `.then` callback checks the flag before calling `setCollections`.

```ts
useEffect(() => {
  let cancelled = false;
  getUserCollections().then((data) => { if (!cancelled) setCollections(data); });
  return () => { cancelled = true; };
}, []);
```

**Verified:** Opened and immediately closed the Create Item drawer multiple times in quick succession. Zero console errors or React warnings throughout.

---

## Verification

**Method:** Playwright browser automation against the local dev server (`npm run dev`).

| # | Step | Result |
|---|------|--------|
| 1 | Open prompt in view mode — MarkdownEditor shows preview | ✅ |
| 2 | Click Edit — MarkdownEditor switches to Write tab with textarea | ✅ |
| 3 | Change font size to 16 on settings page | ✅ |
| 4 | Reload settings page — font size shows 16 (not default 13) | ✅ |
| 5 | Open Create Item drawer, immediately close — no console errors | ✅ |
| 🔍 | Rapid open/close of drawer multiple times — no unmounted-component warnings | ✅ |
