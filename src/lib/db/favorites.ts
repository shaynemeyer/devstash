import { db } from "@/lib/db";

export interface FavoriteItem {
  id: string;
  title: string;
  typeName: string;
  typeIcon: string;
  typeColor: string;
  updatedAt: Date;
}

export interface FavoriteCollection {
  id: string;
  name: string;
  updatedAt: Date;
}

export async function getFavoriteItems(userId: string): Promise<FavoriteItem[]> {
  try {
    const items = await db.item.findMany({
      where: { userId, isFavorite: true },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        updatedAt: true,
        type: { select: { name: true, icon: true, color: true } },
      },
    });
    return items.map((item) => ({
      id: item.id,
      title: item.title,
      updatedAt: item.updatedAt,
      typeName: item.type.name,
      typeIcon: item.type.icon,
      typeColor: item.type.color,
    }));
  } catch {
    return [];
  }
}

export async function getFavoriteCollections(userId: string): Promise<FavoriteCollection[]> {
  try {
    return await db.collection.findMany({
      where: { userId, isFavorite: true },
      orderBy: { updatedAt: "desc" },
      select: { id: true, name: true, updatedAt: true },
    });
  } catch {
    return [];
  }
}
