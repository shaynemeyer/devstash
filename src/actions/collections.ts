"use server";

import { auth } from "@/auth";
import {
  createCollection as dbCreateCollection,
  getUserCollectionsList,
  updateCollection as dbUpdateCollection,
  deleteCollection as dbDeleteCollection,
} from "@/lib/db/collections";
import { CreateCollectionSchema, UpdateCollectionSchema } from "@/lib/validations/collections";
import type { CreatedCollection } from "@/lib/db/collections";

export async function getUserCollections(): Promise<{ id: string; name: string }[]> {
  const session = await auth();
  if (!session?.user?.id) return [];
  return getUserCollectionsList(session.user.id);
}

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

export async function updateCollection(
  id: string,
  input: unknown
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const result = UpdateCollectionSchema.safeParse(input);
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message };
  }

  const updated = await dbUpdateCollection(id, session.user.id, result.data);
  if (!updated) {
    return { success: false, error: "Failed to update collection" };
  }

  return { success: true, data: updated };
}

export async function deleteCollection(id: string): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const ok = await dbDeleteCollection(id, session.user.id);
  if (!ok) {
    return { success: false, error: "Failed to delete collection" };
  }

  return { success: true };
}
