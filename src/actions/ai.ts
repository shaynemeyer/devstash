"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { openai, AI_MODEL } from "@/lib/openai";
import { aiLimiter, checkRateLimit } from "@/lib/rate-limit";
import { GenerateAutoTagsSchema, GenerateDescriptionSchema, ExplainCodeSchema, OptimizePromptSchema } from "@/lib/validations/ai";

interface AutoTagsResult {
  success: boolean;
  tags?: string[];
  error?: string;
}

export async function generateAutoTags(input: unknown): Promise<AutoTagsResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const user = await db.user.findUnique({ where: { id: session.user.id }, select: { isPro: true } });
  if (!user?.isPro) {
    return { success: false, error: "AI features require a Pro subscription." };
  }

  const allowed = await checkRateLimit(aiLimiter, `ai:${session.user.id}`);
  if (!allowed) {
    return { success: false, error: "Rate limit reached. You can generate tags up to 20 times per hour." };
  }

  const result = GenerateAutoTagsSchema.safeParse(input);
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message };
  }

  const { title, content } = result.data;
  const truncated = content ? content.slice(0, 2000) : "";
  const userInput = `Title: ${title}\n${truncated ? `Content: ${truncated}` : ""}\nReturn json.`.trim();

  try {
    const response = await openai.responses.create({
      model: AI_MODEL,
      instructions:
        "You are a developer tool assistant. Suggest 3-5 concise, relevant tags for the given item. Return only a JSON object with a 'tags' array of lowercase strings. No explanations.",
      input: userInput,
      text: { format: { type: "json_object" } },
    });

    const raw = response.output_text;
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return { success: false, error: "Failed to parse AI response." };
    }

    let tags: string[] = [];
    if (Array.isArray(parsed)) {
      tags = parsed.filter((t): t is string => typeof t === "string");
    } else if (
      parsed !== null &&
      typeof parsed === "object" &&
      "tags" in parsed &&
      Array.isArray((parsed as { tags: unknown }).tags)
    ) {
      tags = ((parsed as { tags: unknown[] }).tags).filter((t): t is string => typeof t === "string");
    }

    tags = tags.map((t) => t.toLowerCase().trim()).filter(Boolean).slice(0, 5);

    return { success: true, tags };
  } catch {
    return { success: false, error: "AI service error. Please try again." };
  }
}

interface GenerateDescriptionResult {
  success: boolean;
  description?: string;
  error?: string;
}

export async function generateDescription(input: unknown): Promise<GenerateDescriptionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const user = await db.user.findUnique({ where: { id: session.user.id }, select: { isPro: true } });
  if (!user?.isPro) {
    return { success: false, error: "AI features require a Pro subscription." };
  }

  const allowed = await checkRateLimit(aiLimiter, `ai:${session.user.id}`);
  if (!allowed) {
    return { success: false, error: "Rate limit reached. You can generate descriptions up to 20 times per hour." };
  }

  const result = GenerateDescriptionSchema.safeParse(input);
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message };
  }

  const { title, content, itemType } = result.data;
  const truncated = content ? content.slice(0, 2000) : "";
  const userInput = [
    title ? `Title: ${title}` : "",
    `Type: ${itemType}`,
    truncated ? `Content: ${truncated}` : "",
  ].filter(Boolean).join("\n");

  try {
    const response = await openai.responses.create({
      model: AI_MODEL,
      instructions:
        "You are a developer tool assistant. Write a concise 1-2 sentence description for the given developer item. The description should clearly convey what the item is and its purpose. Return only the description text, no extra formatting or explanation.",
      input: userInput,
    });

    const description = response.output_text.trim();
    if (!description) {
      return { success: false, error: "AI returned an empty description." };
    }

    return { success: true, description };
  } catch {
    return { success: false, error: "AI service error. Please try again." };
  }
}

interface ExplainCodeResult {
  success: boolean;
  explanation?: string;
  error?: string;
}

export async function explainCode(input: unknown): Promise<ExplainCodeResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const user = await db.user.findUnique({ where: { id: session.user.id }, select: { isPro: true } });
  if (!user?.isPro) {
    return { success: false, error: "AI features require a Pro subscription." };
  }

  const allowed = await checkRateLimit(aiLimiter, `ai:${session.user.id}`);
  if (!allowed) {
    return { success: false, error: "Rate limit reached. You can explain code up to 20 times per hour." };
  }

  const result = ExplainCodeSchema.safeParse(input);
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message };
  }

  const { content, language, itemType } = result.data;
  const truncated = content.slice(0, 3000);
  const userInput = [
    language ? `Language: ${language}` : "",
    `Type: ${itemType}`,
    `Code:\n${truncated}`,
  ].filter(Boolean).join("\n");

  try {
    const response = await openai.responses.create({
      model: AI_MODEL,
      instructions:
        "You are a developer tool assistant. Explain the given code or command concisely in 200-300 words. Cover what it does, how it works, and any key concepts or patterns used. Use plain markdown with short paragraphs. No code fences unless showing a specific example.",
      input: userInput,
    });

    const explanation = response.output_text.trim();
    if (!explanation) {
      return { success: false, error: "AI returned an empty explanation." };
    }

    return { success: true, explanation };
  } catch {
    return { success: false, error: "AI service error. Please try again." };
  }
}

interface OptimizePromptResult {
  success: boolean;
  optimizedPrompt?: string;
  error?: string;
}

export async function optimizePrompt(input: unknown): Promise<OptimizePromptResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const user = await db.user.findUnique({ where: { id: session.user.id }, select: { isPro: true } });
  if (!user?.isPro) {
    return { success: false, error: "AI features require a Pro subscription." };
  }

  const allowed = await checkRateLimit(aiLimiter, `ai:${session.user.id}`);
  if (!allowed) {
    return { success: false, error: "Rate limit reached. You can optimize prompts up to 20 times per hour." };
  }

  const result = OptimizePromptSchema.safeParse(input);
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message };
  }

  const { content } = result.data;
  const truncated = content.slice(0, 4000);

  try {
    const response = await openai.responses.create({
      model: AI_MODEL,
      instructions:
        "You are an expert prompt engineer. Refine the given prompt for clarity, specificity, and LLM effectiveness. Preserve the original intent. Return only the improved prompt text — no preamble, no explanation, no extra formatting.",
      input: truncated,
    });

    const optimizedPrompt = response.output_text.trim();
    if (!optimizedPrompt) {
      return { success: false, error: "AI returned an empty result." };
    }

    return { success: true, optimizedPrompt };
  } catch {
    return { success: false, error: "AI service error. Please try again." };
  }
}
