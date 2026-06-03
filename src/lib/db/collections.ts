import { db } from "@/lib/db";

interface TypeIcon {
  icon: string;
  color: string;
}

function getTypeMeta(items: { type: { icon: string; color: string } }[]): {
  dominantColor: string;
  typeIcons: TypeIcon[];
} {
  const counts = new Map<string, { count: number; color: string; icon: string }>();
  for (const item of items) {
    const { icon, color } = item.type;
    const existing = counts.get(icon);
    if (existing) existing.count++;
    else counts.set(icon, { count: 1, color, icon });
  }
  const sorted = [...counts.values()].sort((a, b) => b.count - a.count);
  return {
    dominantColor: sorted[0]?.color ?? "#6b7280",
    typeIcons: sorted.map((t) => ({ icon: t.icon, color: t.color })),
  };
}

export interface SidebarCollection {
  id: string;
  name: string;
  isFavorite: boolean;
  itemCount: number;
  dominantColor: string;
}

export async function getSidebarCollections(userId: string): Promise<SidebarCollection[]> {
  try {
    const collections = await db.collection.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      include: {
        items: {
          include: {
            item: {
              select: { type: { select: { icon: true, color: true } } },
            },
          },
        },
      },
    });

    return collections.map((col) => {
      const { dominantColor } = getTypeMeta(col.items.map((ic) => ic.item));
      return {
        id: col.id,
        name: col.name,
        isFavorite: col.isFavorite,
        itemCount: col.items.length,
        dominantColor,
      };
    });
  } catch {
    return [];
  }
}

export interface CollectionWithMeta {
  id: string;
  name: string;
  description: string | null;
  isFavorite: boolean;
  itemCount: number;
  dominantColor: string;
  typeIcons: TypeIcon[];
}

export async function getRecentCollections(
  userId: string,
  limit = 6
): Promise<CollectionWithMeta[]> {
  try {
    const collections = await db.collection.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      take: limit,
      include: {
        items: {
          include: {
            item: {
              select: { type: { select: { icon: true, color: true } } },
            },
          },
        },
      },
    });

    return collections.map((col) => {
      const { dominantColor, typeIcons } = getTypeMeta(col.items.map((ic) => ic.item));
      return {
        id: col.id,
        name: col.name,
        description: col.description,
        isFavorite: col.isFavorite,
        itemCount: col.items.length,
        dominantColor,
        typeIcons,
      };
    });
  } catch {
    return [];
  }
}

export async function getAllCollections(userId: string): Promise<CollectionWithMeta[]> {
  try {
    const collections = await db.collection.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      include: {
        items: {
          include: {
            item: {
              select: { type: { select: { icon: true, color: true } } },
            },
          },
        },
      },
    });

    return collections.map((col) => {
      const { dominantColor, typeIcons } = getTypeMeta(col.items.map((ic) => ic.item));
      return {
        id: col.id,
        name: col.name,
        description: col.description,
        isFavorite: col.isFavorite,
        itemCount: col.items.length,
        dominantColor,
        typeIcons,
      };
    });
  } catch {
    return [];
  }
}

export interface CollectionDetail {
  id: string;
  name: string;
  description: string | null;
  isFavorite: boolean;
  dominantColor: string;
  typeIcons: TypeIcon[];
}

export async function getCollectionDetail(
  userId: string,
  collectionId: string
): Promise<CollectionDetail | null> {
  try {
    const col = await db.collection.findUnique({
      where: { id: collectionId, userId },
      include: {
        items: {
          include: {
            item: {
              select: { type: { select: { icon: true, color: true } } },
            },
          },
        },
      },
    });

    if (!col) return null;

    const { dominantColor, typeIcons } = getTypeMeta(col.items.map((ic) => ic.item));
    return {
      id: col.id,
      name: col.name,
      description: col.description,
      isFavorite: col.isFavorite,
      dominantColor,
      typeIcons,
    };
  } catch {
    return null;
  }
}

export async function getUserCollectionsList(
  userId: string
): Promise<{ id: string; name: string }[]> {
  try {
    return await db.collection.findMany({
      where: { userId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });
  } catch {
    return [];
  }
}

export interface CreatedCollection {
  id: string;
  name: string;
  description: string | null;
}

export async function createCollection(data: {
  name: string;
  description?: string | null;
  userId: string;
}): Promise<CreatedCollection | null> {
  try {
    const collection = await db.collection.create({
      data: {
        name: data.name,
        description: data.description ?? null,
        userId: data.userId,
      },
      select: { id: true, name: true, description: true },
    });
    return collection;
  } catch {
    return null;
  }
}
