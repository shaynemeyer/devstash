# Current Feature

## Status

Not Started

## Goals

## Notes

## History

See [context/feature-history.md](feature-history.md) for the full archive of completed features.

- User Settings Page: new /settings route (auth-protected) with ChangePasswordForm (email users only) and DeleteAccountDialog moved from /profile; Settings link added to SidebarUserArea dropdown; /profile now shows account info and usage stats only

- Editor Preferences Settings: EditorPreferencesContext + Provider in DashboardShell; EditorPreferencesForm with font size, tab size, theme, word wrap, minimap, line numbers; auto-save via server action; editorPreferences JSON column on User; applied to Monaco CodeEditor; 11 Vitest tests

- Favorites Page: /favorites route (auth-protected) with star icon in TopBar; compact VS Code-style list view of favorited items and collections; ItemDrawer on item click; collection navigation on collection row click; empty state; sorted by updatedAt desc

- Client-Side Sorting on Favorites: ShadCN Select (Name/Date/Type) + asc/desc toggle in FavoritesList; useMemo-derived sorted lists for items and collections; Type sort falls back to Name for collections; default Date desc
