"use server";

import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { auth } from "@/auth";
import { createItem as dbCreateItem, updateItem as dbUpdateItem, deleteItem as dbDeleteItem, setItemPinned, setItemFavorite } from "@/lib/db/items";
import { CreateItemSchema, UpdateItemSchema } from "@/lib/validations/items";
import { checkItemLimit } from "@/lib/subscription";
import { r2, R2_BUCKET } from "@/lib/r2";
import type { ItemDetail } from "@/lib/db/items";

interface ActionResult {
  success: boolean;
  data?: ItemDetail;
  error?: string;
}

export async function createItem(input: unknown): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const limitError = await checkItemLimit(session.user.id);
  if (limitError) return { success: false, error: limitError };

  const result = CreateItemSchema.safeParse(input);
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message };
  }

  const { typeId, title, description, content, url, language, tags, fileUrl, fileName, fileSize, collectionIds } = result.data;

  const created = await dbCreateItem({
    typeId,
    title,
    description: description ?? null,
    content: content ?? null,
    url: url ?? null,
    language: language ?? null,
    tags,
    userId: session.user.id,
    fileUrl: fileUrl ?? null,
    fileName: fileName ?? null,
    fileSize: fileSize ?? null,
    collectionIds,
  });

  if (!created) {
    return { success: false, error: "Failed to create item" };
  }

  return { success: true, data: created };
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
    fileUrl: data.fileUrl ?? null,
    fileName: data.fileName ?? null,
    fileSize: data.fileSize ?? null,
    collectionIds: data.collectionIds,
  });

  if (!updated) {
    return { success: false, error: "Failed to update item" };
  }

  return { success: true, data: updated };
}

export async function toggleItemPin(
  itemId: string,
  isPinned: boolean
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const ok = await setItemPinned(itemId, session.user.id, !isPinned);
  if (!ok) {
    return { success: false, error: "Failed to update pin" };
  }

  return { success: true };
}

export async function toggleFavoriteItem(
  itemId: string,
  isFavorite: boolean
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const ok = await setItemFavorite(itemId, session.user.id, !isFavorite);
  if (!ok) {
    return { success: false, error: "Failed to update favorite" };
  }

  return { success: true };
}

export async function deleteItem(itemId: string): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const { ok, fileUrl } = await dbDeleteItem(itemId, session.user.id);
  if (!ok) {
    return { success: false, error: "Failed to delete item" };
  }

  if (fileUrl) {
    await r2.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: fileUrl })).catch((err) => {
      console.error("R2 delete failed for key:", fileUrl, err);
    });
  }

  return { success: true };
}
