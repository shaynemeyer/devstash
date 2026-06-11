# Current Feature

## Status

Not Started

## Goals

## Notes

## History

See [context/feature-history.md](feature-history.md) for the full archive of completed features.

- AI Optimize Prompt: optimizePrompt server action (auth, Pro gate, Zod, 20 req/hr rate limit); Optimize button in MarkdownEditor header for prompt read view; optimized result panel with Use This/Dismiss; applyOptimized in useItemEdit switches drawer to edit mode; Crown icon for free users; 8 unit tests
- AI Explain Code: explainCode server action (auth, Pro gate, Zod, 20 req/hr rate limit); Explain button in CodeEditor header for snippet/command read view; Code/Explain tab toggle; markdown explanation rendering; Crown icon for free users; isPro threaded to all ItemDrawer callers; 8 unit tests
- AI Generate Description: generateDescription server action (auth, Pro gate, Zod, 20 req/hr rate limit), GenerateDescriptionButton component next to Description field in Create and Edit drawers; also fixed generateAutoTags json_object format error; 6 unit tests
