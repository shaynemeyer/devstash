# Current Feature: AI Auto-Tagging

## Status

In Progress

## Goals

- Create OpenAI client utility with `AI_MODEL` constant (`gpt-5-nano`)
- Create `generateAutoTags` server action with auth, Pro gating, Zod validation, and rate limiting (20 req/hr per user)
- Add "Suggest Tags" button (Sparkles icon, ghost variant) in create item dialog and item drawer edit mode
- Display suggested tags as badges with accept (check) and reject (X) controls per tag
- Accepted tags get added to the item's tag list (freeform, not DB-limited)
- Hide Suggest Tags button for free users (Pro-only UI and server gating)
- Error handling via toast (Pro gating, rate limit, AI service errors)
- Unit tests for the server action

## Notes

- Use the **Responses API** (`client.responses.create()`), NOT Chat Completions — gpt-5-nano returns empty content with Chat Completions
- `response.output_text` is where content lives; use `text: { format: { type: 'json_object' } }` for structured output
- Model may return `{"tags": [...]}` OR `[...]` — handle both; normalize tags to lowercase
- Truncate content to 2000 chars before API call
- `OPENAI_API_KEY` already in `.env`
- `isPro` is available server-side via session; for UI gating pass it as a prop or fetch client-side
- See `context/features/ai-auto-tag-spec.md` for full spec and gotchas

## History

See [context/feature-history.md](feature-history.md) for the full archive of completed features.

- Stripe Phase 1: installed Stripe SDK; exposed isPro on NextAuth session; added free-tier item/collection limits; wired limit checks into createItem and createCollection; 10 unit tests
- Stripe Phase 2: checkout session route, customer portal route, webhook handler (signature verification + 3 event types), BillingSection component (free/pro states), settings page DB isPro fetch; 5 unit tests
- Language Select Dropdown: new LanguageSelect component (shadcn Select, 25 Monaco language IDs); replaced plain text input with dropdown positioned above the code editor in both Create and Edit item drawers for snippet and command types
