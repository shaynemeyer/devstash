import { Star } from "lucide-react";
import { getIcon } from "@/lib/icons";
import { ItemWithMeta } from "@/lib/db/items";

interface ItemCardProps {
  item: ItemWithMeta;
}

export function ItemCard({ item }: ItemCardProps) {
  const Icon = getIcon(item.typeIcon);
  const date = item.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return (
    <div className="rounded-xl border border-border bg-card flex items-stretch overflow-hidden hover:bg-card/80 transition-colors cursor-pointer">
      <div className="w-1 shrink-0" style={{ backgroundColor: item.typeColor }} />
      <div className="flex items-start gap-3 p-4 flex-1 min-w-0">
        <div
          className="size-9 rounded-md flex items-center justify-center shrink-0 mt-0.5"
          style={{ backgroundColor: item.typeColor + "22" }}
        >
          <Icon className="size-4" style={{ color: item.typeColor }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
            <div className="flex items-center gap-1.5 shrink-0">
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
