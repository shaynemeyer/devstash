import { describe, it, expect } from "vitest";
import { CreateItemSchema, UpdateItemSchema } from "./items";

describe("UpdateItemSchema", () => {
  const base = {
    title: "My Item",
    tags: [],
  };

  it("accepts a minimal valid payload", () => {
    const result = UpdateItemSchema.safeParse(base);
    expect(result.success).toBe(true);
  });

  it("rejects an empty title", () => {
    const result = UpdateItemSchema.safeParse({ ...base, title: "" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("Title is required");
  });

  it("trims whitespace from title and rejects whitespace-only title", () => {
    const result = UpdateItemSchema.safeParse({ ...base, title: "   " });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid URL", () => {
    const result = UpdateItemSchema.safeParse({ ...base, url: "not-a-url" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("Must be a valid URL");
  });

  it("accepts a valid URL", () => {
    const result = UpdateItemSchema.safeParse({ ...base, url: "https://example.com" });
    expect(result.success).toBe(true);
  });

  it("accepts null for url", () => {
    const result = UpdateItemSchema.safeParse({ ...base, url: null });
    expect(result.success).toBe(true);
  });

  it("defaults tags to empty array when omitted", () => {
    const result = UpdateItemSchema.safeParse({ title: "Test" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.tags).toEqual([]);
  });

  it("accepts an array of tags", () => {
    const result = UpdateItemSchema.safeParse({ ...base, tags: ["react", "hooks"] });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.tags).toEqual(["react", "hooks"]);
  });

  it("accepts null for optional fields", () => {
    const result = UpdateItemSchema.safeParse({
      ...base,
      description: null,
      content: null,
      language: null,
      url: null,
    });
    expect(result.success).toBe(true);
  });
});

describe("CreateItemSchema", () => {
  const base = {
    typeId: "type-1",
    typeName: "Snippet",
    title: "My Snippet",
    tags: [],
  };

  it("accepts a minimal valid payload", () => {
    const result = CreateItemSchema.safeParse(base);
    expect(result.success).toBe(true);
  });

  it("rejects an empty title", () => {
    const result = CreateItemSchema.safeParse({ ...base, title: "" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("Title is required");
  });

  it("rejects missing typeId", () => {
    const result = CreateItemSchema.safeParse({ ...base, typeId: "" });
    expect(result.success).toBe(false);
  });

  it("requires URL for Link type", () => {
    const result = CreateItemSchema.safeParse({ ...base, typeName: "Link", url: null });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("URL is required for links");
  });

  it("rejects an invalid URL for Link type", () => {
    const result = CreateItemSchema.safeParse({ ...base, typeName: "Link", url: "not-a-url" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("Must be a valid URL");
  });

  it("accepts a valid URL for Link type", () => {
    const result = CreateItemSchema.safeParse({ ...base, typeName: "Link", url: "https://example.com" });
    expect(result.success).toBe(true);
  });

  it("accepts optional URL for non-Link types", () => {
    const result = CreateItemSchema.safeParse({ ...base, url: null });
    expect(result.success).toBe(true);
  });

  it("defaults tags to empty array when omitted", () => {
    const { tags: _, ...noTags } = base; // eslint-disable-line @typescript-eslint/no-unused-vars
    const result = CreateItemSchema.safeParse(noTags);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.tags).toEqual([]);
  });

  it("requires fileUrl for File type", () => {
    const result = CreateItemSchema.safeParse({ ...base, typeName: "File", fileUrl: null });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("A file is required");
  });

  it("requires fileUrl for Image type", () => {
    const result = CreateItemSchema.safeParse({ ...base, typeName: "Image", fileUrl: null });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("A file is required");
  });

  it("accepts File type with fileUrl", () => {
    const result = CreateItemSchema.safeParse({
      ...base,
      typeName: "File",
      fileUrl: "user-1/uuid-doc.pdf",
      fileName: "doc.pdf",
      fileSize: 12345,
    });
    expect(result.success).toBe(true);
  });

  it("accepts Image type with fileUrl", () => {
    const result = CreateItemSchema.safeParse({
      ...base,
      typeName: "Image",
      fileUrl: "user-1/uuid-photo.png",
      fileName: "photo.png",
      fileSize: 500000,
    });
    expect(result.success).toBe(true);
  });
});
