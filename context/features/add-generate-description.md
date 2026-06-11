# Feature: Generate Description via AI

## Goal

Add an icon button next to the description field in the item create and edit drawers. Clicking it calls an AI action that reads the current title and content (or url/fileName for link/file types) from the form inputs and returns a 1–2 sentence description, which is then populated into the description field — no save required.

## Scope

- Works for all item types: Snippet, Prompt, Command, Note, Link, File, Image
- Uses whatever is currently in the form inputs (unsaved state is fine)
- Pro only (same gate as other AI features)
- Uses OpenAI `gpt-4o-mini` via the existing OpenAI client

## UX

- Small icon button (e.g. `Sparkles`) placed inline at the right of the description field label or as a trailing icon inside/beside the textarea
- Shows a loading spinner while the request is in flight
- On success: populates the description textarea with the generated text
- On error: shows a toast with a short error message
- Button is disabled if neither title nor content is present (nothing to summarize)

## Server Action

- File: `src/actions/ai.ts` (add alongside `generateAutoTags`)
- Name: `generateDescription`
- Auth: session required
- Pro gate: `session.user.isPro` required
- Input (Zod schema):
  - `title` — string, optional
  - `content` — string, optional (text content or url or fileName)
  - `itemType` — string (e.g. "Snippet", "Link", etc.)
- Calls OpenAI Responses API with a focused system prompt asking for a 1–2 sentence description
- Returns `{ success: true, description: string }` or `{ success: false, error: string }`
- Rate limit: reuse the existing 20 req/hr pattern from `generateAutoTags`

## Component

- File: `src/components/items/GenerateDescriptionButton.tsx`
- Props: `{ title?: string; content?: string; itemType: string; onGenerated: (description: string) => void; isPro: boolean }`
- Renders nothing (or a disabled button) if `!isPro`
- Disabled when both `title` and `content` are empty

## Integration Points

- Add to `CreateItemDrawer` and `EditItemDrawer`, wired to the current form field values
- `isPro` already threaded through `DashboardShell` — pass it down the same way as `SuggestTagsButton`

## Out of Scope

- Saving the item automatically after generation
- Generating descriptions in bulk
- Custom types
