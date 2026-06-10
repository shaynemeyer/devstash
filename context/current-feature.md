# Current Feature: Language Select Dropdown

## Status

In Progress

## Goals

- Replace the plain text language input with a dropdown that sits above the content editor
- Selecting a language immediately updates Monaco syntax highlighting as the user types
- Applies to both the Create item drawer and the Edit item drawer (snippet, command types)

## Notes

- New `LanguageSelect` component: `src/components/items/LanguageSelect.tsx` — thin shadcn `Select` wrapper, controlled, no internal state
- Languages list: plaintext, typescript, javascript, python, rust, go, java, c, cpp, csharp, html, css, json, yaml, toml, sql, bash, dockerfile, markdown, ruby, php, swift, kotlin, graphql, xml
- Default to `plaintext` when language is empty/undefined
- No schema or action changes needed — `language` already stored on `Item`
- No new dependencies — use existing shadcn `Select` and Monaco's built-in language support
- View mode unchanged — language shown in CodeEditor header bar

## History

See [context/feature-history.md](feature-history.md) for the full archive of completed features.

- Stripe Phase 1: installed Stripe SDK; exposed isPro on NextAuth session; added free-tier item/collection limits; wired limit checks into createItem and createCollection; 10 unit tests
- Stripe Phase 2: checkout session route, customer portal route, webhook handler (signature verification + 3 event types), BillingSection component (free/pro states), settings page DB isPro fetch; 5 unit tests
