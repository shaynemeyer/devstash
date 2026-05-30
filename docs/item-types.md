# Item Types

All 7 system item types in DevStash. System types are read-only (`isSystem: true`) and seeded via `prisma/seed.ts`. Custom types are Pro-only (future).

---

## Per-Type Reference

| Type    | DB ID            | Icon         | Hex Color | Content Classification | URL Slug          |
| ------- | ---------------- | ------------ | --------- | ---------------------- | ----------------- |
| Snippet | `system-snippet` | `Code`       | `#3b82f6` | text                   | `/items/snippets` |
| Prompt  | `system-prompt`  | `Sparkles`   | `#8b5cf6` | text                   | `/items/prompts`  |
| Command | `system-command` | `Terminal`   | `#f97316` | text                   | `/items/commands` |
| Note    | `system-note`    | `StickyNote` | `#fde047` | text                   | `/items/notes`    |
| File    | `system-file`    | `File`       | `#6b7280` | file (Pro)             | `/items/files`    |
| Image   | `system-image`   | `Image`      | `#ec4899` | file (Pro)             | `/items/images`   |
| Link    | `system-link`    | `Link`       | `#10b981` | url                    | `/items/links`    |

### Snippet

- **Purpose**: Reusable code blocks in any language (TypeScript, Dockerfile, etc.)
- **Key fields**: `content` (text), `language` (e.g. `"typescript"`, `"bash"`, `"dockerfile"`)
- **Notes**: Most common type. Supports syntax highlighting via `language` field.

### Prompt

- **Purpose**: AI system prompts, instruction templates, and workflow prompts
- **Key fields**: `content` (text), `language: null` (plain text, no syntax highlighting)
- **Notes**: Content often contains `{{PLACEHOLDERS}}` for variable substitution.

### Command

- **Purpose**: Shell/CLI one-liners and scripts for everyday dev tasks
- **Key fields**: `content` (text), `language` (typically `"bash"`)
- **Notes**: Short commands; quick-copy is the primary use case.

### Note

- **Purpose**: Freeform markdown notes, explanations, or documentation fragments
- **Key fields**: `content` (text), `language: null`
- **Notes**: Rendered with a markdown editor in the UI.

### File

- **Purpose**: Upload and store arbitrary dev files (configs, scripts, context docs)
- **Key fields**: `fileUrl`, `fileName`, `fileSize`; `content` unused
- **Notes**: Pro-only. Files stored in Cloudflare R2. `contentType = file`.

### Image

- **Purpose**: Screenshots, diagrams, design assets
- **Key fields**: `fileUrl`, `fileName`, `fileSize`; `content` unused
- **Notes**: Pro-only. Same R2 storage as File. Differentiated by type for filtering/display.

### Link

- **Purpose**: Bookmarks to external documentation, tools, or resources
- **Key fields**: `url` (required); `content: null`, no `language`
- **Notes**: Simplest type — no content body, just a URL + title + description + tags.

---

## Content Classification

The `Item.contentType` enum (`text | file | url`) determines which fields hold the item's primary data:

| `contentType` | Primary field(s)                  | Types that use it              |
| ------------- | --------------------------------- | ------------------------------ |
| `text`        | `content` (nullable Text)         | Snippet, Prompt, Command, Note |
| `file`        | `fileUrl`, `fileName`, `fileSize` | File, Image                    |
| `url`         | `url`                             | Link                           |

---

## Shared Properties

All items share these fields regardless of type:

| Field         | Purpose                                          |
| ------------- | ------------------------------------------------ |
| `title`       | Display name                                     |
| `description` | Optional short summary                           |
| `isFavorite`  | Starred by user                                  |
| `isPinned`    | Pinned to top of dashboard                       |
| `tags`        | Many-to-many via `TagsOnItems`                   |
| `collections` | Many-to-many via `ItemCollection`                |
| `userId`      | Owner (cascade delete on user removal)           |
| `typeId`      | FK to `ItemType` (determines icon, color, route) |
| `createdAt`   | Immutable creation timestamp                     |
| `updatedAt`   | Auto-updated on every write                      |

---

## Display Differences

| Aspect           | text types                          | file types              | url type      |
| ---------------- | ----------------------------------- | ----------------------- | ------------- |
| Card preview     | Truncated content                   | File name + size        | URL hostname  |
| Drawer body      | Markdown / syntax-highlighted block | Download link / preview | Clickable URL |
| `language` field | Used for syntax highlighting        | N/A                     | N/A           |
| Import from file | Yes (code import)                   | Yes (upload)            | No            |

Icon rendering uses `src/lib/icons.ts` — the `icon` string stored on `ItemType` is looked up in `ICON_MAP` (keyed by Lucide component name). Falls back to `Code` for unknown names.
