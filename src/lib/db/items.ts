import { db } from "@/lib/db";

export interface ItemTypeWithCount {
  id: string;
  name: string;
  icon: string;
  color: string;
  count: number;
}

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
  try {
    const items = await db.item.findMany({
      where: { userId, isPinned: true },
      orderBy: { updatedAt: "desc" },
      include: {
        type: { select: { icon: true, color: true, name: true } },
        tags: { include: { tag: { select: { name: true } } } },
      },
    });

    return items.map(toItemWithMeta);
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
      include: {
        type: { select: { icon: true, color: true, name: true } },
        tags: { include: { tag: { select: { name: true } } } },
      },
    });

    return items.map(toItemWithMeta);
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

export async function getItemsByTypeSlug(userId: string, slug: string): Promise<ItemWithMeta[]> {
  const slugToName: Record<string, string> = {
    snippets: "Snippet",
    prompts: "Prompt",
    commands: "Command",
    notes: "Note",
    files: "File",
    images: "Image",
    links: "Link",
  };
  const typeName = slugToName[slug];
  if (!typeName) return [];

  try {
    const items = await db.item.findMany({
      where: { userId, type: { name: typeName, isSystem: true } },
      orderBy: { createdAt: "desc" },
      include: {
        type: { select: { icon: true, color: true, name: true } },
        tags: { include: { tag: { select: { name: true } } } },
      },
    });
    return items.map(toItemWithMeta);
  } catch {
    return [];
  }
}

export interface ItemDetail extends ItemWithMeta {
  content: string | null;
  contentType: string;
  language: string | null;
  url: string | null;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  updatedAt: Date;
  collections: string[];
}

export async function getItemDetail(id: string, userId: string): Promise<ItemDetail | null> {
  try {
    const item = await db.item.findUnique({
      where: { id, userId },
      select: {
        id: true,
        title: true,
        description: true,
        content: true,
        contentType: true,
        language: true,
        url: true,
        fileUrl: true,
        fileName: true,
        fileSize: true,
        isFavorite: true,
        isPinned: true,
        createdAt: true,
        updatedAt: true,
        type: { select: { icon: true, color: true, name: true } },
        tags: { select: { tag: { select: { name: true } } } },
        collections: { select: { collection: { select: { name: true } } } },
      },
    });

    if (!item) return null;

    return {
      id: item.id,
      title: item.title,
      description: item.description,
      content: item.content,
      contentType: item.contentType,
      language: item.language,
      url: item.url,
      fileUrl: item.fileUrl,
      fileName: item.fileName,
      fileSize: item.fileSize,
      isFavorite: item.isFavorite,
      isPinned: item.isPinned,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      typeIcon: item.type.icon,
      typeColor: item.type.color,
      typeName: item.type.name,
      tags: item.tags.map((t) => t.tag.name),
      collections: item.collections.map((c) => c.collection.name),
    };
  } catch {
    return null;
  }
}

export interface UpdateItemData {
  title: string;
  description: string | null;
  content: string | null;
  url: string | null;
  language: string | null;
  tags: string[];
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
      select: {
        id: true,
        title: true,
        description: true,
        content: true,
        contentType: true,
        language: true,
        url: true,
        fileUrl: true,
        fileName: true,
        fileSize: true,
        isFavorite: true,
        isPinned: true,
        createdAt: true,
        updatedAt: true,
        type: { select: { icon: true, color: true, name: true } },
        tags: { select: { tag: { select: { name: true } } } },
        collections: { select: { collection: { select: { name: true } } } },
      },
    });

    return {
      id: item.id,
      title: item.title,
      description: item.description,
      content: item.content,
      contentType: item.contentType,
      language: item.language,
      url: item.url,
      fileUrl: item.fileUrl,
      fileName: item.fileName,
      fileSize: item.fileSize,
      isFavorite: item.isFavorite,
      isPinned: item.isPinned,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      typeIcon: item.type.icon,
      typeColor: item.type.color,
      typeName: item.type.name,
      tags: item.tags.map((t) => t.tag.name),
      collections: item.collections.map((c) => c.collection.name),
    };
  } catch {
    return null;
  }
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
