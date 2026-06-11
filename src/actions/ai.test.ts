import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("@/lib/openai", () => ({
  openai: {
    responses: {
      create: vi.fn(),
    },
  },
  AI_MODEL: "gpt-5-nano",
}));

vi.mock("@/lib/rate-limit", () => ({
  aiLimiter: {},
  checkRateLimit: vi.fn().mockResolvedValue(true),
}));

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { openai } from "@/lib/openai";
import { checkRateLimit } from "@/lib/rate-limit";
import { generateAutoTags, generateDescription, explainCode } from "./ai";

const mockAuth = vi.mocked(auth);
const mockFindUnique = vi.mocked(db.user.findUnique);
const mockResponsesCreate = vi.mocked(openai.responses.create);
const mockCheckRateLimit = vi.mocked(checkRateLimit);

beforeEach(() => {
  vi.clearAllMocks();
  mockCheckRateLimit.mockResolvedValue(true);
});

describe("generateAutoTags", () => {
  it("returns Unauthorized when not authenticated", async () => {
    mockAuth.mockResolvedValue(null);
    const result = await generateAutoTags({ title: "test" });
    expect(result).toEqual({ success: false, error: "Unauthorized" });
  });

  it("returns Pro error for free users", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as never);
    mockFindUnique.mockResolvedValue({ isPro: false } as never);
    const result = await generateAutoTags({ title: "test" });
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/Pro/);
  });

  it("returns rate limit error when limit exceeded", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as never);
    mockFindUnique.mockResolvedValue({ isPro: true } as never);
    mockCheckRateLimit.mockResolvedValue(false);
    const result = await generateAutoTags({ title: "test" });
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/Rate limit/);
  });

  it("returns validation error for empty title", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as never);
    mockFindUnique.mockResolvedValue({ isPro: true } as never);
    const result = await generateAutoTags({ title: "" });
    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it("parses tags from {tags: [...]} response", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as never);
    mockFindUnique.mockResolvedValue({ isPro: true } as never);
    mockResponsesCreate.mockResolvedValue({ output_text: JSON.stringify({ tags: ["React", "Hooks", "TypeScript"] }) } as never);
    const result = await generateAutoTags({ title: "React hooks example", content: "const [x] = useState()" });
    expect(result.success).toBe(true);
    expect(result.tags).toEqual(["react", "hooks", "typescript"]);
  });

  it("parses tags from bare array response", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as never);
    mockFindUnique.mockResolvedValue({ isPro: true } as never);
    mockResponsesCreate.mockResolvedValue({ output_text: JSON.stringify(["React", "Hooks"]) } as never);
    const result = await generateAutoTags({ title: "test" });
    expect(result.success).toBe(true);
    expect(result.tags).toEqual(["react", "hooks"]);
  });

  it("truncates content to 2000 chars before API call", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as never);
    mockFindUnique.mockResolvedValue({ isPro: true } as never);
    mockResponsesCreate.mockResolvedValue({ output_text: JSON.stringify({ tags: ["tag"] }) } as never);
    const longContent = "x".repeat(3000);
    await generateAutoTags({ title: "test", content: longContent });
    const callArg = mockResponsesCreate.mock.calls[0][0] as { input: string };
    expect(callArg.input).toContain("x".repeat(2000));
    expect(callArg.input).not.toContain("x".repeat(2001));
  });

  it("returns error when API throws", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as never);
    mockFindUnique.mockResolvedValue({ isPro: true } as never);
    mockResponsesCreate.mockRejectedValue(new Error("network error"));
    const result = await generateAutoTags({ title: "test" });
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/AI service error/);
  });
});

describe("generateDescription", () => {
  it("returns Unauthorized when not authenticated", async () => {
    mockAuth.mockResolvedValue(null);
    const result = await generateDescription({ itemType: "snippet" });
    expect(result).toEqual({ success: false, error: "Unauthorized" });
  });

  it("returns Pro error for free users", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as never);
    mockFindUnique.mockResolvedValue({ isPro: false } as never);
    const result = await generateDescription({ itemType: "snippet" });
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/Pro/);
  });

  it("returns rate limit error when limit exceeded", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as never);
    mockFindUnique.mockResolvedValue({ isPro: true } as never);
    mockCheckRateLimit.mockResolvedValue(false);
    const result = await generateDescription({ itemType: "snippet" });
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/Rate limit/);
  });

  it("returns validation error when itemType is missing", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as never);
    mockFindUnique.mockResolvedValue({ isPro: true } as never);
    const result = await generateDescription({});
    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it("returns generated description on success", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as never);
    mockFindUnique.mockResolvedValue({ isPro: true } as never);
    mockResponsesCreate.mockResolvedValue({ output_text: "A reusable React hook for managing form state." } as never);
    const result = await generateDescription({ title: "useForm hook", content: "export function useForm...", itemType: "snippet" });
    expect(result.success).toBe(true);
    expect(result.description).toBe("A reusable React hook for managing form state.");
  });

  it("returns error when API returns empty text", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as never);
    mockFindUnique.mockResolvedValue({ isPro: true } as never);
    mockResponsesCreate.mockResolvedValue({ output_text: "   " } as never);
    const result = await generateDescription({ title: "test", itemType: "note" });
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/empty/);
  });

  it("returns error when API throws", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as never);
    mockFindUnique.mockResolvedValue({ isPro: true } as never);
    mockResponsesCreate.mockRejectedValue(new Error("network error"));
    const result = await generateDescription({ title: "test", itemType: "prompt" });
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/AI service error/);
  });
});

describe("explainCode", () => {
  it("returns Unauthorized when not authenticated", async () => {
    mockAuth.mockResolvedValue(null);
    const result = await explainCode({ content: "console.log('hi')", itemType: "snippet" });
    expect(result).toEqual({ success: false, error: "Unauthorized" });
  });

  it("returns Pro error for free users", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as never);
    mockFindUnique.mockResolvedValue({ isPro: false } as never);
    const result = await explainCode({ content: "console.log('hi')", itemType: "snippet" });
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/Pro/);
  });

  it("returns rate limit error when limit exceeded", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as never);
    mockFindUnique.mockResolvedValue({ isPro: true } as never);
    mockCheckRateLimit.mockResolvedValue(false);
    const result = await explainCode({ content: "console.log('hi')", itemType: "snippet" });
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/Rate limit/);
  });

  it("returns validation error when content is empty", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as never);
    mockFindUnique.mockResolvedValue({ isPro: true } as never);
    const result = await explainCode({ content: "", itemType: "snippet" });
    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it("returns explanation on success", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as never);
    mockFindUnique.mockResolvedValue({ isPro: true } as never);
    mockResponsesCreate.mockResolvedValue({ output_text: "This snippet logs a greeting to the console." } as never);
    const result = await explainCode({ content: "console.log('hello')", language: "javascript", itemType: "snippet" });
    expect(result.success).toBe(true);
    expect(result.explanation).toBe("This snippet logs a greeting to the console.");
  });

  it("returns error when API returns empty text", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as never);
    mockFindUnique.mockResolvedValue({ isPro: true } as never);
    mockResponsesCreate.mockResolvedValue({ output_text: "   " } as never);
    const result = await explainCode({ content: "ls -la", itemType: "command" });
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/empty/);
  });

  it("returns error when API throws", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as never);
    mockFindUnique.mockResolvedValue({ isPro: true } as never);
    mockResponsesCreate.mockRejectedValue(new Error("network error"));
    const result = await explainCode({ content: "git status", itemType: "command" });
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/AI service error/);
  });

  it("truncates content to 3000 chars before API call", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as never);
    mockFindUnique.mockResolvedValue({ isPro: true } as never);
    mockResponsesCreate.mockResolvedValue({ output_text: "explanation" } as never);
    const longContent = "x".repeat(4000);
    await explainCode({ content: longContent, itemType: "snippet" });
    const callArg = mockResponsesCreate.mock.calls[0][0] as { input: string };
    expect(callArg.input).toContain("x".repeat(3000));
    expect(callArg.input).not.toContain("x".repeat(3001));
  });
});
