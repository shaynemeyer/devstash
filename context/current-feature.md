# Current Feature: Drawer Font Size & Width Improvements

## Status

In Progress

## Goals

- Widen `ItemDrawer` `SheetContent` from `sm:max-w-lg` to `sm:max-w-2xl`
- Increase `ItemDrawerHeader` title font from `text-base` to `text-lg` (both read and edit mode input)
- Increase `ItemDrawerActionBar` action button text from `text-xs` to `text-sm` (all buttons + download link)
- Increase `MarkdownEditor` toolbar button text from `text-xs` to `text-sm`, textarea from `text-sm` to `text-base`, preview div from `prose-sm` to `prose-base`

## Notes

- No new components, no new dependencies
- Code editor font size is out of scope (user-controlled)
- Section labels, tag/collection pills, and details metadata are intentionally left at `text-xs`
- Measured via Playwright computed styles before changes

## History

See [context/feature-history.md](feature-history.md) for the full archive of completed features.

- AI Optimize Prompt: optimizePrompt server action (auth, Pro gate, Zod, 20 req/hr rate limit); Optimize button in MarkdownEditor header for prompt read view; optimized result panel with Use This/Dismiss; applyOptimized in useItemEdit switches drawer to edit mode; Crown icon for free users; 8 unit tests
- AI Explain Code: explainCode server action (auth, Pro gate, Zod, 20 req/hr rate limit); Explain button in CodeEditor header for snippet/command read view; Code/Explain tab toggle; markdown explanation rendering; Crown icon for free users; isPro threaded to all ItemDrawer callers; 8 unit tests
- AI Generate Description: generateDescription server action (auth, Pro gate, Zod, 20 req/hr rate limit), GenerateDescriptionButton component next to Description field in Create and Edit drawers; also fixed generateAutoTags json_object format error; 6 unit tests
