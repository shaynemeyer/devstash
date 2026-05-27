import { db } from "@/lib/db";

export interface ItemWithMeta {
  id: string;
  title: string;
  description: string | null;
  isFavorite: boolean;
  isPinned: boolean;
  createdAt: Date;
  typeIcon: string;
  typeColor: string;
  typeName: string;
  tags: string[];
}

export interface DashboardStats {
  totalItems: number;
  totalCollections: number;
  favoriteItems: number;
  favoriteCollections: number;
}

export async function getPinnedItems(userId: string): Promise<ItemWithMeta[]> {
  const items = await db.item.findMany({
    where: { userId, isPinned: true },
    orderBy: { updatedAt: "desc" },
    include: {
      type: true,
      tags: { include: { tag: true } },
    },
  });

  return items.map(toItemWithMeta);
}

export async function getRecentItems(userId: string, limit = 10): Promise<ItemWithMeta[]> {
  const items = await db.item.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      type: true,
      tags: { include: { tag: true } },
    },
  });

  return items.map(toItemWithMeta);
}

export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  const [totalItems, totalCollections, favoriteItems, favoriteCollections] = await Promise.all([
    db.item.count({ where: { userId } }),
    db.collection.count({ where: { userId } }),
    db.item.count({ where: { userId, isFavorite: true } }),
    db.collection.count({ where: { userId, isFavorite: true } }),
  ]);

  return { totalItems, totalCollections, favoriteItems, favoriteCollections };
}

function toItemWithMeta(item: {
  id: string;
  title: string;
  description: string | null;
  isFavorite: boolean;
  isPinned: boolean;
  createdAt: Date;
  type: { icon: string; color: string; name: string };
  tags: { tag: { name: string } }[];
}): ItemWithMeta {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    isFavorite: item.isFavorite,
    isPinned: item.isPinned,
    createdAt: item.createdAt,
    typeIcon: item.type.icon,
    typeColor: item.type.color,
    typeName: item.type.name,
    tags: item.tags.map((t) => t.tag.name),
  };
}
