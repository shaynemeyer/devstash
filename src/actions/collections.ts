"use server";

import { auth } from "@/auth";
import { createCollection as dbCreateCollection } from "@/lib/db/collections";
import { CreateCollectionSchema } from "@/lib/validations/collections";
import type { CreatedCollection } from "@/lib/db/collections";

interface ActionResult {
  success: boolean;
  data?: CreatedCollection;
  error?: string;
}

export async function createCollection(input: unknown): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const result = CreateCollectionSchema.safeParse(input);
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message };
  }

  const { name, description } = result.data;

  const created = await dbCreateCollection({
    name,
    description: description ?? null,
    userId: session.user.id,
  });

  if (!created) {
    return { success: false, error: "Failed to create collection" };
  }

  return { success: true, data: created };
}
