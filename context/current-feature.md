# Current Feature: Add Client-Side Sorting to Favorites

## Status

In Progress

## Goals

- Sort control (ShadCN Select) in favorites page header with "Sort by" label
- Sort options: Name (alpha), Date (updatedAt), Type (items only)
- Direction toggle: asc/desc per sort field
- Default: Date descending (preserves current behavior)
- Sorting applied independently to items list and collections list
- Type sort option disabled/hidden for the collections section
- No server round-trip — pure client-side with `useState` + `useMemo`

## Notes

## History

See [context/feature-history.md](feature-history.md) for the full archive of completed features.

- User Settings Page: new /settings route (auth-protected) with ChangePasswordForm (email users only) and DeleteAccountDialog moved from /profile; Settings link added to SidebarUserArea dropdown; /profile now shows account info and usage stats only

- Editor Preferences Settings: EditorPreferencesContext + Provider in DashboardShell; EditorPreferencesForm with font size, tab size, theme, word wrap, minimap, line numbers; auto-save via server action; editorPreferences JSON column on User; applied to Monaco CodeEditor; 11 Vitest tests

- Favorites Page: /favorites route (auth-protected) with star icon in TopBar; compact VS Code-style list view of favorited items and collections; ItemDrawer on item click; collection navigation on collection row click; empty state; sorted by updatedAt desc
