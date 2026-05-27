import { db } from "@/lib/db";

export interface TypeIcon {
  icon: string;
  color: string;
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
  const collections = await db.collection.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    take: limit,
    include: {
      items: {
        include: {
          item: {
            include: { type: true },
          },
        },
      },
    },
  });

  return collections.map((col) => {
    const typeCounts = new Map<string, { count: number; color: string; icon: string }>();

    for (const ic of col.items) {
      const { icon, color } = ic.item.type;
      const existing = typeCounts.get(icon);
      if (existing) {
        existing.count++;
      } else {
        typeCounts.set(icon, { count: 1, color, icon });
      }
    }

    const sorted = [...typeCounts.values()].sort((a, b) => b.count - a.count);

    return {
      id: col.id,
      name: col.name,
      description: col.description,
      isFavorite: col.isFavorite,
      itemCount: col.items.length,
      dominantColor: sorted[0]?.color ?? "#6b7280",
      typeIcons: sorted.map((t) => ({ icon: t.icon, color: t.color })),
    };
  });
}
