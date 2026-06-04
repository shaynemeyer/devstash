"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";

export interface SearchItem {
  id: string;
  title: string;
  typeName: string;
  typeIcon: string;
  typeColor: string;
}

export interface SearchCollection {
  id: string;
  name: string;
  itemCount: number;
}

export interface SearchData {
  items: SearchItem[];
  collections: SearchCollection[];
}

export async function getSearchData(): Promise<SearchData> {
  const session = await auth();
  if (!session?.user?.id) return { items: [], collections: [] };

  const userId = session.user.id;

  const [items, collections] = await Promise.all([
    db.item.findMany({
      where: { userId },
      select: {
        id: true,
        title: true,
        type: { select: { name: true, icon: true, color: true } },
      },
      orderBy: { updatedAt: "desc" },
    }),
    db.collection.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        _count: { select: { items: true } },
      },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  return {
    items: items.map((item) => ({
      id: item.id,
      title: item.title,
      typeName: item.type.name,
      typeIcon: item.type.icon,
      typeColor: item.type.color,
    })),
    collections: collections.map((col) => ({
      id: col.id,
      name: col.name,
      itemCount: col._count.items,
    })),
  };
}
