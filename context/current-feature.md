# Current Feature: Generate Description via AI

## Status

In Progress

## Goals

- Add a Sparkles icon button next to the description field in Create and Edit item drawers
- Clicking it calls `generateDescription` server action with current title + content (unsaved state)
- On success: populates the description textarea with the 1–2 sentence AI-generated text
- On error: shows a toast with a short error message
- Button disabled when both title and content are empty
- Pro only; renders nothing (or disabled) for free users
- Works for all item types: Snippet, Prompt, Command, Note, Link, File, Image

## Notes

- Server action: `generateDescription` in `src/actions/ai.ts` alongside `generateAutoTags`
- Component: `src/components/items/GenerateDescriptionButton.tsx`
- Uses `gpt-4o-mini` via existing OpenAI client
- Zod input: `title` (optional string), `content` (optional string), `itemType` (string)
- Returns `{ success: true, description: string }` or `{ success: false, error: string }`
- Rate limit: reuse 20 req/hr pattern from `generateAutoTags`
- `isPro` already threaded through `DashboardShell` — pass down same way as `SuggestTagsButton`
- Out of scope: auto-save after generation, bulk generation, custom types

## History

See [context/feature-history.md](feature-history.md) for the full archive of completed features.

- Stripe Phase 1: installed Stripe SDK; exposed isPro on NextAuth session; added free-tier item/collection limits; wired limit checks into createItem and createCollection; 10 unit tests
- Stripe Phase 2: checkout session route, customer portal route, webhook handler (signature verification + 3 event types), BillingSection component (free/pro states), settings page DB isPro fetch; 5 unit tests
- Language Select Dropdown: new LanguageSelect component (shadcn Select, 25 Monaco language IDs); replaced plain text input with dropdown positioned above the code editor in both Create and Edit item drawers for snippet and command types
- AI Auto-Tagging: OpenAI client (gpt-5-nano, Responses API), generateAutoTags server action (auth, Pro gate, Zod, 20 req/hr rate limit), SuggestTagsButton component with per-tag accept/reject badges; wired into create and edit drawers; isPro threaded from session through DashboardShell; 8 unit tests
