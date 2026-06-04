import { describe, it, expect } from "vitest";
import { EditorPreferencesSchema, DEFAULT_EDITOR_PREFERENCES } from "./settings";

describe("EditorPreferencesSchema", () => {
  const valid = {
    fontSize: 13,
    tabSize: 2,
    wordWrap: true,
    minimap: false,
    lineNumbers: true,
    theme: "vs-dark",
  };

  it("accepts a valid payload", () => {
    expect(EditorPreferencesSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts all valid themes", () => {
    for (const theme of ["vs-dark", "monokai", "github-dark"]) {
      expect(EditorPreferencesSchema.safeParse({ ...valid, theme }).success).toBe(true);
    }
  });

  it("rejects an unknown theme", () => {
    const result = EditorPreferencesSchema.safeParse({ ...valid, theme: "solarized" });
    expect(result.success).toBe(false);
  });

  it("rejects fontSize below minimum (10)", () => {
    const result = EditorPreferencesSchema.safeParse({ ...valid, fontSize: 9 });
    expect(result.success).toBe(false);
  });

  it("rejects fontSize above maximum (24)", () => {
    const result = EditorPreferencesSchema.safeParse({ ...valid, fontSize: 25 });
    expect(result.success).toBe(false);
  });

  it("rejects non-integer fontSize", () => {
    const result = EditorPreferencesSchema.safeParse({ ...valid, fontSize: 13.5 });
    expect(result.success).toBe(false);
  });

  it("rejects tabSize below minimum (2)", () => {
    const result = EditorPreferencesSchema.safeParse({ ...valid, tabSize: 1 });
    expect(result.success).toBe(false);
  });

  it("rejects tabSize above maximum (8)", () => {
    const result = EditorPreferencesSchema.safeParse({ ...valid, tabSize: 9 });
    expect(result.success).toBe(false);
  });

  it("rejects missing fields", () => {
    const { fontSize, ...rest } = valid;
    const result = EditorPreferencesSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });
});

describe("DEFAULT_EDITOR_PREFERENCES", () => {
  it("matches the schema", () => {
    expect(EditorPreferencesSchema.safeParse(DEFAULT_EDITOR_PREFERENCES).success).toBe(true);
  });

  it("has expected defaults", () => {
    expect(DEFAULT_EDITOR_PREFERENCES.fontSize).toBe(13);
    expect(DEFAULT_EDITOR_PREFERENCES.tabSize).toBe(2);
    expect(DEFAULT_EDITOR_PREFERENCES.wordWrap).toBe(true);
    expect(DEFAULT_EDITOR_PREFERENCES.minimap).toBe(false);
    expect(DEFAULT_EDITOR_PREFERENCES.lineNumbers).toBe(true);
    expect(DEFAULT_EDITOR_PREFERENCES.theme).toBe("vs-dark");
  });
});
