import { z } from "zod"

export const EditorPreferencesSchema = z.object({
  fontSize: z.number().int().min(10).max(24),
  tabSize: z.number().int().min(2).max(8),
  wordWrap: z.boolean(),
  minimap: z.boolean(),
  lineNumbers: z.boolean(),
  theme: z.enum(["vs-dark", "monokai", "github-dark"]),
})

export type EditorPreferences = z.infer<typeof EditorPreferencesSchema>

export const DEFAULT_EDITOR_PREFERENCES: EditorPreferences = {
  fontSize: 13,
  tabSize: 2,
  wordWrap: true,
  minimap: false,
  lineNumbers: true,
  theme: "vs-dark",
}
