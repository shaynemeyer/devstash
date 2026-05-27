import Link from "next/link";
import { Star, Code, Sparkles, Terminal, StickyNote, File, Image, Link as LinkIcon } from "lucide-react";
import { CollectionWithMeta } from "@/lib/db/collections";

const ICON_MAP = { Code, Sparkles, Terminal, StickyNote, File, Image, Link: LinkIcon };

interface Props {
  collections: CollectionWithMeta[];
}

export function RecentCollections({ collections }: Props) {
  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-foreground">Collections</h2>
        <Link href="/collections" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
          View all
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {collections.map((col) => (
          <Link
            key={col.id}
            href={`/collections/${col.id}`}
            className="group rounded-xl border border-border bg-card flex items-stretch overflow-hidden hover:bg-card/80 transition-colors"
          >
            <div className="w-1 shrink-0" style={{ backgroundColor: col.dominantColor }} />
            <div className="flex flex-col gap-2 p-4 flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                {col.isFavorite && (
                  <Star className="size-3.5 text-amber-400 fill-amber-400 shrink-0" />
                )}
                <p className="text-sm font-semibold text-foreground truncate">{col.name}</p>
              </div>
              <p className="text-xs text-muted-foreground">{col.itemCount} items</p>
              <p className="text-xs text-muted-foreground line-clamp-2 flex-1">{col.description}</p>
              <div className="flex items-center gap-1.5 pt-1">
                {col.typeIcons.slice(0, 4).map(({ icon, color }) => {
                  const Icon = ICON_MAP[icon as keyof typeof ICON_MAP];
                  return Icon ? (
                    <Icon key={icon} className="size-3.5" style={{ color }} />
                  ) : null;
                })}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
