"use client";

import { Star } from "lucide-react";
import { getIcon } from "@/lib/icons";
import { TypeBadge } from "@/components/items/TypeBadge";
import type { ItemWithMeta } from "@/lib/db/items";

interface ItemListRowProps {
  item: ItemWithMeta;
  showTags?: boolean;
  showFavorite?: boolean;
  showTypeBadge?: boolean;
  onClick?: () => void;
}

export function ItemListRow({ item, showTags, showFavorite, showTypeBadge, onClick }: ItemListRowProps) {
  const Icon = getIcon(item.typeIcon);
  const date = item.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const alignItems = showTags ? "items-start" : "items-center";
  const padding = showTags ? "p-4" : "p-3";
  const iconMargin = showTags ? "mt-0.5" : "";

  return (
    <div
      onClick={onClick}
      className="rounded-xl border border-border bg-card flex items-stretch overflow-hidden hover:bg-card/80 transition-colors cursor-pointer"
    >
      <div className="w-1 shrink-0" style={{ backgroundColor: item.typeColor }} />
      <div className={`flex ${alignItems} gap-3 ${padding} flex-1 min-w-0`}>
        <TypeBadge icon={Icon} color={item.typeColor} size="sm" className={iconMargin} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
          <p className={`text-xs text-muted-foreground ${showTags ? "mt-0.5 line-clamp-1" : "truncate"}`}>
            {item.description}
          </p>
          {showTags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {item.tags.map((tag) => (
                <span key={tag} className="text-xs px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className={`flex items-center gap-2 shrink-0 ${showTags ? "mt-0.5" : ""}`}>
          {showFavorite && item.isFavorite && (
            <Star className="size-3.5 text-amber-400 fill-amber-400" />
          )}
          {showTypeBadge && (
            <span
              className="hidden sm:block text-xs px-1.5 py-0.5 rounded-md font-medium"
              style={{ backgroundColor: item.typeColor + "22", color: item.typeColor }}
            >
              {item.typeName}
            </span>
          )}
          <span className="text-xs text-muted-foreground tabular-nums">{date}</span>
        </div>
      </div>
    </div>
  );
}
