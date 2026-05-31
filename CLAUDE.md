# DevStash

A developer knowledge hub for snippets, commands, prompts, notes, files, images, links and custom types.

## Context Files

Read the following to get the full context of the project:

- @context/project-overview.md
- @context/coding-standards.md
- @context/ai-interaction.md
- @context/current-feature.md

## Commands

- **Dev server**: `npm run dev` (runs on http://localhost:3000)
- **Build**: `npm run build`
- **Production server**: `npm run start`
- **Lint**: `npm run lint`

All versions should be locked. no `^` in the package.json

## Playwright

After any Playwright verification session:

- Delete all screenshots (`.png`/`.jpeg`) saved to the project directory unless told to keep them
- Kill the browser process: `pkill -f "chrome"; pkill -f "Chromium"; pkill -f "playwright"`

## Neon Database

- Project: `devstash` (ID: `rapid-grass-17252016`)
- **Always use the `development` branch** (ID: `br-nameless-shape-akjezna7`) for all Neon MCP queries
- **Never query or modify the `production` branch** unless explicitly instructed
