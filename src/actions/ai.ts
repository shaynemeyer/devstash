"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { openai, AI_MODEL } from "@/lib/openai";
import { aiLimiter, checkRateLimit } from "@/lib/rate-limit";
import { GenerateAutoTagsSchema } from "@/lib/validations/ai";

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
  const userInput = `Title: ${title}\n${truncated ? `Content: ${truncated}` : ""}`.trim();

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
