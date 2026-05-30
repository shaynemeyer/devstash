import { db } from "@/lib/db";

export interface ProfileUser {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  createdAt: Date;
  hasPassword: boolean;
}

export interface ProfileStats {
  totalItems: number;
  totalCollections: number;
  itemTypeCounts: { name: string; icon: string; color: string; count: number }[];
}

export async function getProfileUser(userId: string): Promise<ProfileUser | null> {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, image: true, createdAt: true, password: true },
    });

    if (!user) return null;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      createdAt: user.createdAt,
      hasPassword: !!user.password,
    };
  } catch {
    return null;
  }
}

export async function getProfileStats(userId: string): Promise<ProfileStats> {
  try {
    const [totalItems, totalCollections, typeCounts] = await Promise.all([
      db.item.count({ where: { userId } }),
      db.collection.count({ where: { userId } }),
      db.itemType.findMany({
        where: { isSystem: true },
        select: {
          name: true,
          icon: true,
          color: true,
          _count: { select: { items: { where: { userId } } } },
        },
      }),
    ]);

    return {
      totalItems,
      totalCollections,
      itemTypeCounts: typeCounts.map((t) => ({
        name: t.name,
        icon: t.icon,
        color: t.color,
        count: t._count.items,
      })),
    };
  } catch {
    return { totalItems: 0, totalCollections: 0, itemTypeCounts: [] };
  }
}
