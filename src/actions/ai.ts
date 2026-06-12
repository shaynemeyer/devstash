"use server";

import { openai, AI_MODEL } from "@/lib/openai";
import { requireAuth, requireProWithRateLimit, parseInput, ActionError } from "@/lib/action-utils";
import { GenerateAutoTagsSchema, GenerateDescriptionSchema, ExplainCodeSchema, OptimizePromptSchema } from "@/lib/validations/ai";

interface AutoTagsResult {
  success: boolean;
  tags?: string[];
  error?: string;
}

export async function generateAutoTags(input: unknown): Promise<AutoTagsResult> {
  try {
    const { userId } = await requireAuth();
    await requireProWithRateLimit(userId, "generate tags");
    const { title, content } = parseInput(GenerateAutoTagsSchema, input);

    const truncated = content ? content.slice(0, 2000) : "";
    const userInput = `Title: ${title}\n${truncated ? `Content: ${truncated}` : ""}\nReturn json.`.trim();

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
  } catch (err) {
    return {
      success: false,
      error: err instanceof ActionError ? err.message : "AI service error. Please try again.",
    };
  }
}

interface GenerateDescriptionResult {
  success: boolean;
  description?: string;
  error?: string;
}

export async function generateDescription(input: unknown): Promise<GenerateDescriptionResult> {
  try {
    const { userId } = await requireAuth();
    await requireProWithRateLimit(userId, "generate descriptions");
    const { title, content, itemType } = parseInput(GenerateDescriptionSchema, input);

    const truncated = content ? content.slice(0, 2000) : "";
    const userInput = [
      title ? `Title: ${title}` : "",
      `Type: ${itemType}`,
      truncated ? `Content: ${truncated}` : "",
    ].filter(Boolean).join("\n");

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
  } catch (err) {
    return {
      success: false,
      error: err instanceof ActionError ? err.message : "AI service error. Please try again.",
    };
  }
}

interface ExplainCodeResult {
  success: boolean;
  explanation?: string;
  error?: string;
}

export async function explainCode(input: unknown): Promise<ExplainCodeResult> {
  try {
    const { userId } = await requireAuth();
    await requireProWithRateLimit(userId, "explain code");
    const { content, language, itemType } = parseInput(ExplainCodeSchema, input);

    const truncated = content.slice(0, 3000);
    const userInput = [
      language ? `Language: ${language}` : "",
      `Type: ${itemType}`,
      `Code:\n${truncated}`,
    ].filter(Boolean).join("\n");

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
  } catch (err) {
    return {
      success: false,
      error: err instanceof ActionError ? err.message : "AI service error. Please try again.",
    };
  }
}

interface OptimizePromptResult {
  success: boolean;
  optimizedPrompt?: string;
  error?: string;
}

export async function optimizePrompt(input: unknown): Promise<OptimizePromptResult> {
  try {
    const { userId } = await requireAuth();
    await requireProWithRateLimit(userId, "optimize prompts");
    const { content } = parseInput(OptimizePromptSchema, input);

    const truncated = content.slice(0, 4000);

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
  } catch (err) {
    return {
      success: false,
      error: err instanceof ActionError ? err.message : "AI service error. Please try again.",
    };
  }
}
