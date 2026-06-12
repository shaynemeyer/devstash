"use server";

import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { createItem as dbCreateItem, updateItem as dbUpdateItem, deleteItem as dbDeleteItem, setItemPinned, setItemFavorite } from "@/lib/db/items";
import { CreateItemSchema, UpdateItemSchema } from "@/lib/validations/items";
import { checkItemLimit } from "@/lib/subscription";
import { r2, R2_BUCKET } from "@/lib/r2";
import { requireAuth, parseInput, withAction, ActionError } from "@/lib/action-utils";
import type { ItemDetail } from "@/lib/db/items";

interface ActionResult {
  success: boolean;
  data?: ItemDetail;
  error?: string;
}

export async function createItem(input: unknown): Promise<ActionResult> {
  return withAction(async () => {
    const { userId } = await requireAuth();
    const limitError = await checkItemLimit(userId);
    if (limitError) throw new ActionError(limitError);
    const { typeId, title, description, content, url, language, tags, fileUrl, fileName, fileSize, collectionIds } = parseInput(CreateItemSchema, input);

    const created = await dbCreateItem({
      typeId,
      title,
      description: description ?? null,
      content: content ?? null,
      url: url ?? null,
      language: language ?? null,
      tags,
      userId,
      fileUrl: fileUrl ?? null,
      fileName: fileName ?? null,
      fileSize: fileSize ?? null,
      collectionIds,
    });

    if (!created) throw new ActionError("Failed to create item");
    return created;
  });
}

export async function updateItem(itemId: string, input: unknown): Promise<ActionResult> {
  return withAction(async () => {
    const { userId } = await requireAuth();
    const data = parseInput(UpdateItemSchema, input);

    const updated = await dbUpdateItem(itemId, userId, {
      title: data.title,
      description: data.description ?? null,
      content: data.content ?? null,
      url: data.url ?? null,
      language: data.language ?? null,
      tags: data.tags,
      fileUrl: data.fileUrl ?? null,
      fileName: data.fileName ?? null,
      fileSize: data.fileSize ?? null,
      collectionIds: data.collectionIds,
    });

    if (!updated) throw new ActionError("Failed to update item");
    return updated;
  });
}

export async function toggleItemPin(
  itemId: string,
  isPinned: boolean
): Promise<{ success: boolean; error?: string }> {
  return withAction(async () => {
    const { userId } = await requireAuth();
    const ok = await setItemPinned(itemId, userId, !isPinned);
    if (!ok) throw new ActionError("Failed to update pin");
  });
}

export async function toggleFavoriteItem(
  itemId: string,
  isFavorite: boolean
): Promise<{ success: boolean; error?: string }> {
  return withAction(async () => {
    const { userId } = await requireAuth();
    const ok = await setItemFavorite(itemId, userId, !isFavorite);
    if (!ok) throw new ActionError("Failed to update favorite");
  });
}

export async function deleteItem(itemId: string): Promise<{ success: boolean; error?: string }> {
  return withAction(async () => {
    const { userId } = await requireAuth();
    const { ok, fileUrl } = await dbDeleteItem(itemId, userId);
    if (!ok) throw new ActionError("Failed to delete item");
    if (fileUrl) {
      await r2.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: fileUrl })).catch((err) => {
        console.error("R2 delete failed for key:", fileUrl, err);
      });
    }
  });
}
