# Current Feature: Favorites Page

## Status

In Progress

## Goals

- Add star icon button to TopBar linking to /favorites
- Create /favorites route with auth protection
- Fetch all user favorited items and collections
- Compact list view (VS Code/terminal style, not cards)
- Each row: type icon, title, type badge, date added
- Separate sections for items and collections with counts
- Click item opens ItemDrawer, click collection navigates to /collections/[id]
- Empty state when no favorites
- Sort by most recently favorited (updatedAt)

## Notes

- UI style: monospace or semi-monospace font, minimal padding, high density, subtle hover states
- No cards or heavy borders — clean lines only

## History

See [context/feature-history.md](feature-history.md) for the full archive of completed features.

- User Settings Page: new /settings route (auth-protected) with ChangePasswordForm (email users only) and DeleteAccountDialog moved from /profile; Settings link added to SidebarUserArea dropdown; /profile now shows account info and usage stats only

- Editor Preferences Settings: EditorPreferencesContext + Provider in DashboardShell; EditorPreferencesForm with font size, tab size, theme, word wrap, minimap, line numbers; auto-save via server action; editorPreferences JSON column on User; applied to Monaco CodeEditor; 11 Vitest tests
