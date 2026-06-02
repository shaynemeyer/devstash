export interface ItemTypeWithCount {
  id: string;
  name: string;
  icon: string;
  color: string;
  count: number;
}

export interface ItemWithMeta {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  url: string | null;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  isFavorite: boolean;
  isPinned: boolean;
  createdAt: Date;
  typeIcon: string;
  typeColor: string;
  typeName: string;
  tags: string[];
}

export interface ItemDetail extends ItemWithMeta {
  contentType: string;
  language: string | null;
  updatedAt: Date;
  collections: string[];
}

export interface DashboardStats {
  totalItems: number;
  totalCollections: number;
  favoriteItems: number;
  favoriteCollections: number;
}

export const ITEM_SELECT = {
  id: true,
  title: true,
  description: true,
  content: true,
  url: true,
  fileUrl: true,
  fileName: true,
  fileSize: true,
  language: true,
  isFavorite: true,
  isPinned: true,
  createdAt: true,
  type: { select: { name: true, icon: true, color: true } },
  tags: { select: { tag: { select: { name: true } } } },
} as const;

export const ITEM_DETAIL_SELECT = {
  id: true,
  title: true,
  description: true,
  content: true,
  contentType: true,
  url: true,
  fileUrl: true,
  fileName: true,
  fileSize: true,
  language: true,
  isFavorite: true,
  isPinned: true,
  createdAt: true,
  updatedAt: true,
  type: { select: { name: true, icon: true, color: true } },
  tags: { select: { tag: { select: { name: true } } } },
  collections: { select: { collection: { select: { name: true } } } },
} as const;

type ItemRow = {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  url: string | null;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  language: string | null;
  isFavorite: boolean;
  isPinned: boolean;
  createdAt: Date;
  type: { name: string; icon: string; color: string };
  tags: { tag: { name: string } }[];
};

type ItemDetailRow = ItemRow & {
  contentType: string;
  updatedAt: Date;
  collections: { collection: { name: string } }[];
};

export function mapToItemWithMeta(item: ItemRow): ItemWithMeta {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    content: item.content,
    url: item.url,
    fileUrl: item.fileUrl,
    fileName: item.fileName,
    fileSize: item.fileSize,
    isFavorite: item.isFavorite,
    isPinned: item.isPinned,
    createdAt: item.createdAt,
    typeIcon: item.type.icon,
    typeColor: item.type.color,
    typeName: item.type.name,
    tags: item.tags.map((t) => t.tag.name),
  };
}

export function mapToItemDetail(item: ItemDetailRow): ItemDetail {
  return {
    ...mapToItemWithMeta(item),
    contentType: item.contentType,
    language: item.language,
    updatedAt: item.updatedAt,
    collections: item.collections.map((c) => c.collection.name),
  };
}
