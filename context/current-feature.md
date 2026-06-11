# Current Feature: AI Explain Code

## Status

In Progress

## Goals

- Create `explainCode` server action with auth, Pro gating, Zod validation, and rate limiting
- Add "Explain" button (Sparkles icon) to code editor window controls header (next to Copy button)
- Only show for snippet and command types in the item drawer (read view only)
- After generating, show Code/Explain tabs in the editor header to toggle between views
- Render explanation as markdown in the same container space as the code editor
- Explanation is concise (~200-300 words): what the code does and key concepts
- Loading state: Loader2 spinner while generating
- Pro gating in UI: Crown icon + tooltip for free users
- Error handling via toast (Pro gating, rate limit, AI service errors)
- Unit tests for the server action

## Notes

- Uses OpenAI `gpt-4o-mini` model (spec says gpt-5-nano but project standard is gpt-4o-mini)
- Explanations are not saved to the database — regenerated on each click
- Not available in create/edit forms, only in the item drawer read view
- `isPro` needs to be passed as a prop to the item drawer / code editor
- Follow existing patterns (see generateAutoTags and generateDescription actions)

## History

See [context/feature-history.md](feature-history.md) for the full archive of completed features.

- AI Generate Description: generateDescription server action (auth, Pro gate, Zod, 20 req/hr rate limit), GenerateDescriptionButton component next to Description field in Create and Edit drawers; also fixed generateAutoTags json_object format error; 6 unit tests
