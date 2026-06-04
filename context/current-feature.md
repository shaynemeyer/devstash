# Current Feature

## Status

Not Started

## Goals

## Notes

## History

See [context/feature-history.md](feature-history.md) for the full archive of completed features.

- User Settings Page: new /settings route (auth-protected) with ChangePasswordForm (email users only) and DeleteAccountDialog moved from /profile; Settings link added to SidebarUserArea dropdown; /profile now shows account info and usage stats only

- Editor Preferences Settings: EditorPreferencesContext + Provider in DashboardShell; EditorPreferencesForm with font size, tab size, theme, word wrap, minimap, line numbers; auto-save via server action; editorPreferences JSON column on User; applied to Monaco CodeEditor; 11 Vitest tests
