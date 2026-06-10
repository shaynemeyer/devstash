# Feature: Language Select Dropdown

## Status

Not Started

## Goals

Replace the plain text language input with a searchable dropdown that sits **above** the content editor. Selecting a language immediately updates Monaco syntax highlighting as the user types. Applies to both the Create item drawer and the Edit item drawer.

## Scope

- Types affected: `snippet`, `command` (the `LANGUAGE_TYPES` / `CODE_TYPES` arrays)
- No schema or action changes needed — `language` is already stored on `Item`
- No new dependencies — use the existing shadcn `Select` component and Monaco's built-in language support

---

## Implementation Plan

### Step 1 — Create `LanguageSelect` component

**File:** `src/components/items/LanguageSelect.tsx`

- Client component wrapping shadcn `<Select>`
- Exports a curated, sorted list of `LANGUAGES` (constant in the same file):
  - `plaintext`, `typescript`, `javascript`, `python`, `rust`, `go`, `java`, `c`, `cpp`, `csharp`, `html`, `css`, `json`, `yaml`, `toml`, `sql`, `bash`, `dockerfile`, `markdown`, `ruby`, `php`, `swift`, `kotlin`, `graphql`, `xml`
- Props: `value: string`, `onChange: (value: string) => void`
- Render: label text is the display name (e.g. "TypeScript"), value is the Monaco language ID (e.g. `typescript`)
- Use `SelectContent` with `className="max-h-64 overflow-y-auto"` so the list is scrollable

### Step 2 — Update `CreateItemForm`

**File:** `src/components/items/CreateItemForm.tsx`

- Import `LanguageSelect`
- Reorder sections so `showLanguage` renders **before** the content section (between description and content)
- Replace the `<input>` for language with `<LanguageSelect value={language} onChange={setLanguage} />`
- Remove the now-redundant standalone language `<section>` that was below content

### Step 3 — Update `ItemDrawerContent`

**File:** `src/components/items/ItemDrawerContent.tsx`

- Import `LanguageSelect`
- In edit mode: move the language section **before** the content section (same reordering as above)
- Replace the `<input>` for language with `<LanguageSelect value={language} onChange={onLanguageChange} />`
- In read/view mode: language is already displayed in the CodeEditor header bar — no change needed

---

## Notes

- Monaco resolves highlighting from the `language` prop on `<MonacoEditor>` — no extra wiring needed; the existing `CodeEditor` passes `language` straight through.
- Default selection should be `plaintext` when `language` is empty/undefined.
- Keep `LanguageSelect` a thin wrapper — no internal state, controlled component only.
- Do not add a search/filter input inside the select; the native scroll + keyboard navigation on `SelectContent` is sufficient.

---

## Test

- Open Create drawer for Snippet → language dropdown is above the code editor → select "TypeScript" → editor highlights TS syntax
- Open Create drawer for Command → same behaviour
- Open an existing Snippet in view mode → no language selector shown (read-only, language shown in editor header)
- Open an existing Snippet in edit mode → language dropdown pre-populated, reselect a different language → editor re-highlights
- `npm run build` passes with no type errors
