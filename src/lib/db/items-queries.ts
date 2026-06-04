import { db } from "@/lib/db";
import { ITEMS_PER_PAGE } from "@/lib/constants";
import {
  ITEM_SELECT,
  ITEM_DETAIL_SELECT,
  DashboardStats,
  ItemDetail,
  ItemTypeWithCount,
  ItemWithMeta,
  mapToItemDetail,
  mapToItemWithMeta,
} from "./item-select";

const SLUG_TO_NAME: Record<string, string> = {
  snippets: "Snippet",
  prompts: "Prompt",
  commands: "Command",
  notes: "Note",
  files: "File",
  images: "Image",
  links: "Link",
};

export async function getItemTypesWithCounts(userId: string): Promise<ItemTypeWithCount[]> {
  try {
    const types = await db.itemType.findMany({
      where: { isSystem: true },
      include: {
        _count: {
          select: { items: { where: { userId } } },
        },
      },
    });

    return types.map((t) => ({
      id: t.id,
      name: t.name,
      icon: t.icon,
      color: t.color,
      count: t._count.items,
    }));
  } catch {
    return [];
  }
}

export async function getPinnedItems(userId: string): Promise<ItemWithMeta[]> {
  try {
    const items = await db.item.findMany({
      where: { userId, isPinned: true },
      orderBy: { updatedAt: "desc" },
      select: ITEM_SELECT,
    });
    return items.map(mapToItemWithMeta);
  } catch {
    return [];
  }
}

export async function getRecentItems(userId: string, limit = 10): Promise<ItemWithMeta[]> {
  try {
    const items = await db.item.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: ITEM_SELECT,
    });
    return items.map(mapToItemWithMeta);
  } catch {
    return [];
  }
}

export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  try {
    const [totalItems, totalCollections, favoriteItems, favoriteCollections] = await Promise.all([
      db.item.count({ where: { userId } }),
      db.collection.count({ where: { userId } }),
      db.item.count({ where: { userId, isFavorite: true } }),
      db.collection.count({ where: { userId, isFavorite: true } }),
    ]);
    return { totalItems, totalCollections, favoriteItems, favoriteCollections };
  } catch {
    return { totalItems: 0, totalCollections: 0, favoriteItems: 0, favoriteCollections: 0 };
  }
}

export async function getItemsByTypeSlug(
  userId: string,
  slug: string,
  page = 1
): Promise<{ items: ItemWithMeta[]; total: number }> {
  const typeName = SLUG_TO_NAME[slug];
  if (!typeName) return { items: [], total: 0 };

  const where = { userId, type: { name: { equals: typeName, mode: "insensitive" as const }, isSystem: true } };

  try {
    const [items, total] = await Promise.all([
      db.item.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * ITEMS_PER_PAGE,
        take: ITEMS_PER_PAGE,
        select: ITEM_SELECT,
      }),
      db.item.count({ where }),
    ]);
    return { items: items.map(mapToItemWithMeta), total };
  } catch {
    return { items: [], total: 0 };
  }
}

export async function getItemsByCollectionId(
  userId: string,
  collectionId: string,
  page = 1
): Promise<{ items: ItemWithMeta[]; total: number }> {
  const where = { userId, collections: { some: { collectionId } } };

  try {
    const [items, total] = await Promise.all([
      db.item.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * ITEMS_PER_PAGE,
        take: ITEMS_PER_PAGE,
        select: ITEM_SELECT,
      }),
      db.item.count({ where }),
    ]);
    return { items: items.map(mapToItemWithMeta), total };
  } catch {
    return { items: [], total: 0 };
  }
}

export async function getItemDetail(id: string, userId: string): Promise<ItemDetail | null> {
  try {
    const item = await db.item.findUnique({
      where: { id, userId },
      select: ITEM_DETAIL_SELECT,
    });
    if (!item) return null;
    return mapToItemDetail(item);
  } catch {
    return null;
  }
}
