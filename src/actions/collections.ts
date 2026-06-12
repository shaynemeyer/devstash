"use server";

import { auth } from "@/auth";
import {
  createCollection as dbCreateCollection,
  getUserCollectionsList,
  updateCollection as dbUpdateCollection,
  deleteCollection as dbDeleteCollection,
  setCollectionFavorite,
} from "@/lib/db/collections";
import { CreateCollectionSchema, UpdateCollectionSchema } from "@/lib/validations/collections";
import { checkCollectionLimit } from "@/lib/subscription";
import { requireAuth, parseInput, withAction, ActionError } from "@/lib/action-utils";
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
  return withAction(async () => {
    const { userId } = await requireAuth();
    const limitError = await checkCollectionLimit(userId);
    if (limitError) throw new ActionError(limitError);
    const { name, description } = parseInput(CreateCollectionSchema, input);

    const created = await dbCreateCollection({
      name,
      description: description ?? null,
      userId,
    });

    if (!created) throw new ActionError("Failed to create collection");
    return created;
  });
}

export async function updateCollection(id: string, input: unknown): Promise<ActionResult> {
  return withAction(async () => {
    const { userId } = await requireAuth();
    const data = parseInput(UpdateCollectionSchema, input);
    const updated = await dbUpdateCollection(id, userId, data);
    if (!updated) throw new ActionError("Failed to update collection");
    return updated;
  });
}

export async function deleteCollection(id: string): Promise<{ success: boolean; error?: string }> {
  return withAction(async () => {
    const { userId } = await requireAuth();
    const ok = await dbDeleteCollection(id, userId);
    if (!ok) throw new ActionError("Failed to delete collection");
  });
}

export async function toggleFavoriteCollection(
  id: string,
  isFavorite: boolean
): Promise<{ success: boolean; error?: string }> {
  return withAction(async () => {
    const { userId } = await requireAuth();
    const ok = await setCollectionFavorite(id, userId, !isFavorite);
    if (!ok) throw new ActionError("Failed to update collection");
  });
}
