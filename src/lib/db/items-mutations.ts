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
}

const CONTENT_TYPE_MAP: Record<string, ContentType> = {
  Snippet: ContentType.text,
  Prompt: ContentType.text,
  Command: ContentType.text,
  Note: ContentType.text,
  Link: ContentType.url,
  File: ContentType.file,
  Image: ContentType.file,
};

export async function createItem(data: CreateItemData): Promise<ItemDetail | null> {
  try {
    const type = await db.itemType.findUnique({
      where: { id: data.typeId },
      select: { name: true },
    });
    if (!type) return null;

    const contentType = CONTENT_TYPE_MAP[type.name] ?? ContentType.text;

    const item = await db.item.create({
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

    return mapToItemDetail(item);
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
    const item = await db.item.update({
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

    return mapToItemDetail(item);
  } catch {
    return null;
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
