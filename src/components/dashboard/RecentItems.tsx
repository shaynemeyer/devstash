import Link from "next/link";
import { Star } from "lucide-react";
import { getIcon } from "@/lib/icons";
import { ItemWithMeta } from "@/lib/db/items";

interface RecentItemsProps {
  items: ItemWithMeta[];
}

export function RecentItems({ items }: RecentItemsProps) {
  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-foreground">Recent Items</h2>
        <Link href="/items" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
          View all
        </Link>
      </div>
      <div className="flex flex-col gap-2">
        {items.map((item) => {
          const Icon = getIcon(item.typeIcon);
          const date = item.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
          return (
            <div
              key={item.id}
              className="rounded-xl border border-border bg-card p-3 flex items-center gap-3 hover:bg-card/80 transition-colors cursor-pointer"
            >
              <div
                className="size-8 rounded-md flex items-center justify-center shrink-0"
                style={{ backgroundColor: item.typeColor + "22" }}
              >
                <Icon className="size-4" style={{ color: item.typeColor }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                <p className="text-xs text-muted-foreground truncate">{item.description}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {item.isFavorite && (
                  <Star className="size-3.5 text-amber-400 fill-amber-400" />
                )}
                <span
                  className="hidden sm:block text-xs px-1.5 py-0.5 rounded-md font-medium"
                  style={{ backgroundColor: item.typeColor + "22", color: item.typeColor }}
                >
                  {item.typeName}
                </span>
                <span className="text-xs text-muted-foreground tabular-nums">{date}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
