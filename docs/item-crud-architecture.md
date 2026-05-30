# Item CRUD Architecture

Unified design for creating, reading, updating, and deleting all 7 item types. Follows the project's established patterns: server components for data fetching, Server Actions for mutations, Zod for validation, one dynamic route, shared components that adapt by type.

---

## File Structure

```
src/
├── actions/
│   └── items.ts                    # All item mutations (create, update, delete, toggle)
│
├── lib/
│   ├── db/
│   │   └── items.ts                # Read queries (already partially exists)
│   └── validations/
│       └── items.ts                # Zod schemas per contentType
│
├── app/
│   └── items/
│       └── [type]/
│           └── page.tsx            # Dynamic route — one page for all 7 types
│
└── components/
    └── items/
        ├── ItemList.tsx            # Grid of ItemCard components
        ├── ItemCard.tsx            # Single card, color-coded by type
        ├── ItemDrawer.tsx          # Right-side drawer — view/edit/create
        ├── ItemForm.tsx            # Shared form shell; delegates body to type form
        ├── DeleteItemDialog.tsx    # Confirm before delete
        └── forms/
            ├── TextItemFields.tsx  # content + language — Snippet, Prompt, Command, Note
            ├── FileItemFields.tsx  # fileUrl/fileName/fileSize upload — File, Image
            └── LinkItemFields.tsx  # url field — Link
```

---

## `/items/[type]` Routing

The segment `[type]` matches the URL slug for each item type:

| URL                 | Type slug  | DB `ItemType.name` |
| ------------------- | ---------- | ------------------ |
| `/items/snippets`   | `snippets` | `snippet`          |
| `/items/prompts`    | `prompts`  | `prompt`           |
| `/items/commands`   | `commands` | `command`          |
| `/items/notes`      | `notes`    | `note`             |
| `/items/links`      | `links`    | `link`             |
| `/items/files`      | `files`    | `file`             |
| `/items/images`     | `images`   | `image`            |

`page.tsx` maps the slug to a singular type name, looks up the `ItemType` record, then fetches items filtered by that type. Unknown slugs `notFound()`.

```ts
// src/app/items/[type]/page.tsx (server component)
const SLUG_TO_TYPE: Record<string, string> = {
  snippets: "snippet",
  prompts:  "prompt",
  commands: "command",
  notes:    "note",
  links:    "link",
  files:    "file",
  images:   "image",
};

export default async function ItemsPage({ params }: { params: { type: string } }) {
  const typeName = SLUG_TO_TYPE[params.type];
  if (!typeName) notFound();

  const session = await auth();
  const userId  = session!.user.id;

  const [itemType, items] = await Promise.all([
    getItemTypeByName(typeName),
    getItemsByType(userId, typeName),
  ]);

  return <ItemList itemType={itemType} items={items} />;
}
```

---

## Data Layer — `src/lib/db/items.ts`

Extend the existing file with item-type queries. All functions are `async`, called directly from server components.

```ts
// New additions to src/lib/db/items.ts

export async function getItemTypeByName(name: string): Promise<ItemType | null>

export async function getItemsByType(userId: string, typeName: string): Promise<ItemDetail[]>

export async function getItemById(userId: string, itemId: string): Promise<ItemDetail | null>

export async function getAllItems(userId: string): Promise<ItemDetail[]>
```

`ItemDetail` is a flat, typed shape that includes `content`, `url`, `fileUrl`, `fileName`, `fileSize`, `language`, `tags`, and the flattened type fields (`typeIcon`, `typeColor`, `typeName`).

---

## Mutations — `src/actions/items.ts`

One file for all mutations. Each action:
1. Gets session and extracts `userId`
2. Validates input with Zod `.safeParse()`
3. Executes the Prisma write
4. Returns `{ success, data?, error? }`

```ts
// src/actions/items.ts
"use server";

export async function createItem(formData: FormData): Promise<ActionResult>
export async function updateItem(itemId: string, formData: FormData): Promise<ActionResult>
export async function deleteItem(itemId: string): Promise<ActionResult>
export async function toggleFavorite(itemId: string): Promise<ActionResult>
export async function togglePinned(itemId: string): Promise<ActionResult>
```

No type-specific action files — the `contentType` field in the form determines which Zod schema to apply and which fields to write.

---

## Validation — `src/lib/validations/items.ts`

One schema per `contentType`, matching the `Item` model fields:

```ts
// text types: Snippet, Prompt, Command, Note
export const TextItemSchema = z.object({
  title:       z.string().min(1).max(200),
  typeId:      z.string(),
  content:     z.string().min(1),
  language:    z.string().optional(),
  description: z.string().max(500).optional(),
  tags:        z.array(z.string()).max(10).optional(),
  isFavorite:  z.boolean().optional(),
  isPinned:    z.boolean().optional(),
});

// file types: File, Image
export const FileItemSchema = z.object({
  title:       z.string().min(1).max(200),
  typeId:      z.string(),
  fileUrl:     z.string().url(),
  fileName:    z.string(),
  fileSize:    z.number().int().positive(),
  description: z.string().max(500).optional(),
  tags:        z.array(z.string()).max(10).optional(),
});

// url type: Link
export const LinkItemSchema = z.object({
  title:       z.string().min(1).max(200),
  typeId:      z.string(),
  url:         z.string().url(),
  description: z.string().max(500).optional(),
  tags:        z.array(z.string()).max(10).optional(),
});
```

The action reads `contentType` from the form, selects the matching schema, and calls `.safeParse()`.

---

## Component Responsibilities

### `ItemList` (server component wrapper → passes to client)

- Receives `itemType` and `items` from the page
- Renders the page header (type name, color, icon, count)
- Renders the `ItemCard` grid
- Hosts the "New Item" button that opens `ItemDrawer` in create mode

### `ItemCard`

- Displays: title, description snippet, tags, type-colored border/badge, favorite/pin indicators
- On click: opens `ItemDrawer` in view/edit mode for that item

### `ItemDrawer` (client component)

- Right-side sheet; mode: `"view" | "edit" | "create"`
- In view mode: renders read-only content appropriate to `contentType`
  - `text` → syntax-highlighted block or markdown
  - `file`/`image` → download link or image preview
  - `url` → clickable link
- In edit/create mode: renders `ItemForm`
- Hosts Delete button → opens `DeleteItemDialog`

### `ItemForm` (client component)

- Shared form shell: title, description, tags fields (common to all types)
- Renders the correct field group based on `contentType`:
  - `text` → `<TextItemFields>` (content textarea + language select)
  - `file` → `<FileItemFields>` (file upload)
  - `url` → `<LinkItemFields>` (URL input)
- Submits via `createItem` or `updateItem` Server Action
- Shows toast on success/error; closes drawer on success

### `TextItemFields` / `FileItemFields` / `LinkItemFields`

- Isolated, focused field groups — no business logic
- Receive and emit only the fields relevant to their `contentType`
- Type-specific UI only: language dropdown for snippets, file picker for uploads, URL input for links

### `DeleteItemDialog`

- Shadcn `<Dialog>` with confirm prompt
- Calls `deleteItem` action on confirm
- Closes drawer and shows toast on success

---

## Type-Specific Logic Location

| Concern                          | Where it lives                             |
| -------------------------------- | ------------------------------------------ |
| Which fields are shown in form   | `TextItemFields`, `FileItemFields`, `LinkItemFields` |
| Which Zod schema to apply        | `src/actions/items.ts` (reads `contentType`) |
| How content is rendered (view)   | `ItemDrawer` — switch on `contentType`     |
| Syntax highlighting language     | `TextItemFields` — language select         |
| File upload to Cloudflare R2     | `FileItemFields` → API route for upload    |
| Icon and color                   | `ItemType` record from DB (not hardcoded in components) |
| Route slug mapping               | `SLUG_TO_TYPE` in `app/items/[type]/page.tsx` |

The actions file stays type-agnostic. The DB queries stay type-agnostic. Type-specific rendering and field logic is entirely in the leaf components under `components/items/forms/`.

---

## Data Flow Summary

```
User opens /items/snippets
  → page.tsx (server component)
    → getItemsByType(userId, "snippet")  [lib/db/items.ts]
    → renders ItemList with real data

User clicks "New Item"
  → ItemDrawer opens (create mode)
    → ItemForm renders TextItemFields (content, language)
    → user submits
      → createItem(formData) [actions/items.ts]
        → TextItemSchema.safeParse()
        → db.item.create(...)
        → revalidatePath("/items/snippets")
        → returns { success: true }
    → toast shown, drawer closes

User clicks existing item card
  → ItemDrawer opens (view mode)
    → renders syntax-highlighted content block
    → Edit button switches to edit mode → ItemForm prepopulated
    → Delete button → DeleteItemDialog → deleteItem() action
```
