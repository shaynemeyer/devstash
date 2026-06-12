import { Star, Pin } from "lucide-react";
import { getIcon } from "@/lib/icons";
import { ItemWithMeta } from "@/lib/db/items";
import { CopyButton } from "./CopyButton";
import { TypeBadge } from "./TypeBadge";

interface ItemCardProps {
  item: ItemWithMeta;
  onClick?: () => void;
}

export function ItemCard({ item, onClick }: ItemCardProps) {
  const Icon = getIcon(item.typeIcon);
  const date = item.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return (
    <div className="relative group rounded-xl border border-border bg-card flex items-stretch overflow-hidden hover:bg-card/80 transition-colors cursor-pointer" onClick={onClick}>
      <CopyButton value={item.content ?? item.url} />
      <div className="w-1 shrink-0" style={{ backgroundColor: item.typeColor }} />
      <div className="flex items-start gap-3 p-4 flex-1 min-w-0">
        <TypeBadge icon={Icon} color={item.typeColor} className="mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
            <div className="flex items-center gap-1.5 shrink-0">
              {item.isPinned && <Pin className="size-3.5 text-muted-foreground fill-current" />}
              {item.isFavorite && <Star className="size-3.5 text-amber-400 fill-amber-400" />}
              <span className="text-xs text-muted-foreground tabular-nums">{date}</span>
            </div>
          </div>
          {item.description && (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{item.description}</p>
          )}
          {item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-1.5 py-0.5 rounded-md"
                  style={{ backgroundColor: item.typeColor + "22", color: item.typeColor }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
