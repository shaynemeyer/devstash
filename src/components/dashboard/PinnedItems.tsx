import { Pin, Code, Sparkles, Terminal, StickyNote, File, Image, Link as LinkIcon } from "lucide-react";
import { ItemWithMeta } from "@/lib/db/items";

const ICON_MAP = { Code, Sparkles, Terminal, StickyNote, File, Image, Link: LinkIcon };

interface PinnedItemsProps {
  items: ItemWithMeta[];
}

export function PinnedItems({ items }: PinnedItemsProps) {
  if (items.length === 0) return null;

  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <Pin className="size-3.5 text-muted-foreground" />
        <h2 className="text-sm font-semibold text-foreground">Pinned</h2>
      </div>
      <div className="flex flex-col gap-2">
        {items.map((item) => {
          const Icon = ICON_MAP[item.typeIcon as keyof typeof ICON_MAP];
          const date = item.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
          return (
            <div
              key={item.id}
              className="rounded-xl border border-border bg-card flex items-stretch overflow-hidden hover:bg-card/80 transition-colors cursor-pointer"
            >
              <div className="w-1 shrink-0" style={{ backgroundColor: item.typeColor }} />
              <div className="flex items-start gap-3 p-4 flex-1 min-w-0">
                <div
                  className="size-8 rounded-md flex items-center justify-center shrink-0 mt-0.5"
                  style={{ backgroundColor: item.typeColor + "22" }}
                >
                  {Icon && <Icon className="size-4" style={{ color: item.typeColor }} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{item.description}</p>
                  {item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <span className="text-xs text-muted-foreground shrink-0 mt-0.5">{date}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
