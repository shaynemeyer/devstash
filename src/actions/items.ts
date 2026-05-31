"use server";

import { auth } from "@/auth";
import { updateItem as dbUpdateItem, deleteItem as dbDeleteItem } from "@/lib/db/items";
import { UpdateItemSchema } from "@/lib/validations/items";
import type { ItemDetail } from "@/lib/db/items";

interface ActionResult {
  success: boolean;
  data?: ItemDetail;
  error?: string;
}

export async function updateItem(itemId: string, input: unknown): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const result = UpdateItemSchema.safeParse(input);
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message };
  }

  const data = result.data;
  const updated = await dbUpdateItem(itemId, session.user.id, {
    title: data.title,
    description: data.description ?? null,
    content: data.content ?? null,
    url: data.url ?? null,
    language: data.language ?? null,
    tags: data.tags,
  });

  if (!updated) {
    return { success: false, error: "Failed to update item" };
  }

  return { success: true, data: updated };
}

export async function deleteItem(itemId: string): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const ok = await dbDeleteItem(itemId, session.user.id);
  if (!ok) {
    return { success: false, error: "Failed to delete item" };
  }

  return { success: true };
}
