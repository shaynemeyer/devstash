# Current Feature: Optimize Prompt

## Status

In Progress

## Goals

- `optimizePrompt` server action in `src/actions/ai.ts` with auth, Pro gate, Zod, 20 req/hr rate limit
- `OptimizePromptSchema` in `src/lib/validations/ai.ts`: `{ content: string (min 1, max 5000) }`
- Optimize button in `MarkdownEditor` header (read-only mode, mirrors CodeEditor's Explain button)
- Optimized result panel below header with "Use This" and "Dismiss" actions
- "Use This" updates content state, switches drawer to edit mode, shows toast
- Only wired for `typeName === "prompt"` in read view; `isPro` gates Crown icon for free users
- Unit tests for server action (auth failure, Pro gate, rate limit, Zod validation, success, empty AI response)

## Notes

- Follow `explainCode` pattern exactly for server action structure
- Truncate content to 4000 chars before sending to AI
- AI instruction: refine for clarity, specificity, LLM effectiveness; preserve intent; return only improved prompt text
- Return `{ success: boolean; optimizedPrompt?: string; error?: string }`
- `MarkdownEditorProps` additions: `isPro?: boolean`, `onOptimize?: () => Promise<OptimizeResult>`, `onApplyOptimized?: (text: string) => void`
- Button only shown when `readOnly && !!onOptimize`
- Loading state: `Loader2` spinner + "Optimizing…"
- On error: toast the error message
- Apply behavior: update content state → `setEditMode(true)` → toast "Prompt updated — review and save" → dismiss panel
- Not available in create/edit forms — read view only
- `isPro` already threaded to `ItemDrawerContent`

## History

See [context/feature-history.md](feature-history.md) for the full archive of completed features.

- AI Explain Code: explainCode server action (auth, Pro gate, Zod, 20 req/hr rate limit); Explain button in CodeEditor header for snippet/command read view; Code/Explain tab toggle; markdown explanation rendering; Crown icon for free users; isPro threaded to all ItemDrawer callers; 8 unit tests
- AI Generate Description: generateDescription server action (auth, Pro gate, Zod, 20 req/hr rate limit), GenerateDescriptionButton component next to Description field in Create and Edit drawers; also fixed generateAutoTags json_object format error; 6 unit tests
