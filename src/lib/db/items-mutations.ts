import { db } from "@/lib/db";
import { ContentType } from "../../../prisma/generated/prisma/enums";
import { ITEM_DETAIL_SELECT, ItemDetail, mapToItemDetail } from "./item-select";

export interface UpdateItemData {
  title: string;
  description: string | null;
  content: string | null;
  url: string | null;
  language: string | null;
  tags: string[];
  fileUrl?: string | null;
  fileName?: string | null;
  fileSize?: number | null;
  collectionIds?: string[];
}

export interface CreateItemData {
  typeId: string;
  title: string;
  description: string | null;
  content: string | null;
  url: string | null;
  language: string | null;
  tags: string[];
  userId: string;
  fileUrl?: string | null;
  fileName?: string | null;
  fileSize?: number | null;
  collectionIds?: string[];
}

const CONTENT_TYPE_MAP: Record<string, ContentType> = {
  snippet: ContentType.text,
  prompt: ContentType.text,
  command: ContentType.text,
  note: ContentType.text,
  link: ContentType.url,
  file: ContentType.file,
  image: ContentType.file,
};

export async function createItem(data: CreateItemData): Promise<ItemDetail | null> {
  try {
    const type = await db.itemType.findUnique({
      where: { id: data.typeId },
      select: { name: true },
    });
    if (!type) return null;

    const contentType = CONTENT_TYPE_MAP[type.name.toLowerCase()] ?? ContentType.text;

    const result = await db.$transaction(async (tx) => {
      const item = await tx.item.create({
        data: {
          title: data.title,
          description: data.description,
          content: data.content,
          url: data.url,
          language: data.language,
          fileUrl: data.fileUrl ?? null,
          fileName: data.fileName ?? null,
          fileSize: data.fileSize ?? null,
          contentType,
          userId: data.userId,
          typeId: data.typeId,
          tags: {
            create: data.tags.map((name) => ({
              tag: { connectOrCreate: { where: { name }, create: { name } } },
            })),
          },
        },
        select: ITEM_DETAIL_SELECT,
      });

      if (data.collectionIds && data.collectionIds.length > 0) {
        await tx.itemCollection.createMany({
          data: data.collectionIds.map((collectionId) => ({ itemId: item.id, collectionId })),
          skipDuplicates: true,
        });
        return tx.item.findUnique({ where: { id: item.id }, select: ITEM_DETAIL_SELECT });
      }

      return item;
    });

    return result ? mapToItemDetail(result) : null;
  } catch {
    return null;
  }
}

export async function updateItem(
  id: string,
  userId: string,
  data: UpdateItemData
): Promise<ItemDetail | null> {
  try {
    const result = await db.$transaction(async (tx) => {
      const item = await tx.item.update({
        where: { id, userId },
        data: {
          title: data.title,
          description: data.description,
          content: data.content,
          url: data.url,
          language: data.language,
          ...(data.fileUrl !== undefined && { fileUrl: data.fileUrl }),
          ...(data.fileName !== undefined && { fileName: data.fileName }),
          ...(data.fileSize !== undefined && { fileSize: data.fileSize }),
          tags: {
            deleteMany: {},
            create: data.tags.map((name) => ({
              tag: {
                connectOrCreate: {
                  where: { name },
                  create: { name },
                },
              },
            })),
          },
        },
        select: ITEM_DETAIL_SELECT,
      });

      if (data.collectionIds !== undefined) {
        await tx.itemCollection.deleteMany({ where: { itemId: id } });
        if (data.collectionIds.length > 0) {
          await tx.itemCollection.createMany({
            data: data.collectionIds.map((collectionId) => ({ itemId: id, collectionId })),
            skipDuplicates: true,
          });
        }
        return tx.item.findUnique({ where: { id }, select: ITEM_DETAIL_SELECT });
      }

      return item;
    });

    return result ? mapToItemDetail(result) : null;
  } catch {
    return null;
  }
}

export async function setItemPinned(
  id: string,
  userId: string,
  isPinned: boolean
): Promise<boolean> {
  try {
    await db.item.update({ where: { id, userId }, data: { isPinned } });
    return true;
  } catch {
    return false;
  }
}

export async function setItemFavorite(
  id: string,
  userId: string,
  isFavorite: boolean
): Promise<boolean> {
  try {
    await db.item.update({ where: { id, userId }, data: { isFavorite } });
    return true;
  } catch {
    return false;
  }
}

export async function deleteItem(
  id: string,
  userId: string
): Promise<{ ok: boolean; fileUrl: string | null }> {
  try {
    const item = await db.item.findUnique({
      where: { id, userId },
      select: { fileUrl: true },
    });
    if (!item) return { ok: false, fileUrl: null };
    await db.item.delete({ where: { id, userId } });
    return { ok: true, fileUrl: item.fileUrl };
  } catch {
    return { ok: false, fileUrl: null };
  }
}
