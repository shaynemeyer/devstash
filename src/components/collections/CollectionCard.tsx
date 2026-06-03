import Link from "next/link";
import { Star } from "lucide-react";
import { getIcon } from "@/lib/icons";
import { CollectionWithMeta } from "@/lib/db/collections";

interface Props {
  collection: CollectionWithMeta;
}

export function CollectionCard({ collection: col }: Props) {
  return (
    <Link
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
            const Icon = getIcon(icon);
            return <Icon key={icon} className="size-3.5" style={{ color }} />;
          })}
        </div>
      </div>
    </Link>
  );
}
