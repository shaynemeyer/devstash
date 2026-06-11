# Optimize Prompt

## Overview

Add AI-powered prompt optimization for prompt items in the item drawer. When a user clicks "Optimize", the action analyzes their prompt, refines it for clarity, specificity, and effectiveness, then presents the result in-place with an option to apply it. Pro-only feature. Works in the read view only — identical placement pattern to "Explain" on the CodeEditor header.

## Requirements

### Server Action

- Add `optimizePrompt` server action to `src/actions/ai.ts`
- Auth check, Pro gate, Zod validation, rate limit (shared `aiLimiter`, 20 req/hr)
- Add `OptimizePromptSchema` to `src/lib/validations/ai.ts`: `{ content: string (min 1, max 5000) }`
- Truncate content to 4000 chars before sending to AI
- AI instructions: refine the prompt for clarity, specificity, and LLM effectiveness; preserve the original intent; return only the improved prompt text, no preamble or explanation
- Return `{ success: boolean; optimizedPrompt?: string; error?: string }`

### MarkdownEditor Changes

Add "Optimize" button support to `MarkdownEditor` — mirrors how `CodeEditor` handles `onExplain`:

```ts
interface MarkdownEditorProps {
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  isPro?: boolean;
  onOptimize?: () => Promise<OptimizeResult>; // new
}
```

- Button renders in the editor header (right side, before Copy)
- Icon: `Sparkles` (same as Explain)
- Only shown when `readOnly && !!onOptimize`
- Pro gate: Crown icon + `title="AI features require Pro subscription"` for free users
- Loading state: `Loader2` spinner + "Optimizing…" label
- On success: show the optimized prompt in a new "Optimized" panel below the header (not replacing the original) with two actions:
  - **Use This** — calls a new `onApplyOptimized(text: string)` prop, dismisses the panel, shows toast "Prompt updated"
  - **Dismiss** — closes the panel without applying
- On error: toast the error message
- Optimized result is not persisted — user must click "Use This" to apply

### ItemDrawerContent Changes

- Wire up `onOptimize` for prompt type in read view:

  ```tsx
  onOptimize={() => optimizePrompt({ content: item.content ?? "" })}
  onApplyOptimized={(text) => { /* update content state, switch to edit mode or auto-save */ }}
  ```

- `onOptimize` and `onApplyOptimized` only passed when `typeName === "prompt"` and `!editMode`
- Pass `isPro` down to `MarkdownEditor` (already available in scope)

### Apply Behavior

When the user clicks "Use This":

- Call `onApplyOptimized(optimizedText)` which updates the `content` state in the parent drawer
- Switch the drawer into edit mode (`setEditMode(true)`) so the user can review and save
- Show a toast: "Prompt updated — review and save"
- Dismiss the optimized panel

This keeps the save action explicit — the user reviews the change then clicks Save.

## Notes

- Optimization result is not saved automatically — user must review and save
- Not available in create/edit forms, only in the read view
- `isPro` is already threaded through to `ItemDrawerContent`
- Follow `explainCode` pattern exactly for the server action structure
- Unit tests for the server action (auth failure, Pro gate, rate limit, Zod validation, success, empty AI response)
