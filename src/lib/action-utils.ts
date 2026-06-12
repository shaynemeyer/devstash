import { auth } from "@/auth";
import { db } from "@/lib/db";
import { aiLimiter, checkRateLimit } from "@/lib/rate-limit";
import { z } from "zod";

export class ActionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ActionError";
  }
}

export async function requireAuth(): Promise<{ userId: string }> {
  const session = await auth();
  if (!session?.user?.id) throw new ActionError("Unauthorized");
  return { userId: session.user.id };
}

export function parseInput<T>(schema: z.ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new ActionError(result.error.issues[0]?.message ?? "Validation failed");
  }
  return result.data;
}

export async function requireProWithRateLimit(userId: string, feature: string): Promise<void> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isPro: true },
  });
  if (!user?.isPro) throw new ActionError("AI features require a Pro subscription.");
  const allowed = await checkRateLimit(aiLimiter, `ai:${userId}`);
  if (!allowed) {
    throw new ActionError(`Rate limit reached. You can ${feature} up to 20 times per hour.`);
  }
}

export async function withAction<T>(
  fn: () => Promise<T>
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const data = await fn();
    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      error: err instanceof ActionError ? err.message : "An unexpected error occurred.",
    };
  }
}
