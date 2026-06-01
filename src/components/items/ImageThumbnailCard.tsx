import { Star } from "lucide-react";
import { ItemWithMeta } from "@/lib/db/items";

interface ImageThumbnailCardProps {
  item: ItemWithMeta;
  onClick?: () => void;
}

export function ImageThumbnailCard({ item, onClick }: ImageThumbnailCardProps) {
  const src = item.fileUrl ? `/api/files/${item.fileUrl}` : null;

  return (
    <div
      className="rounded-xl border border-border bg-card overflow-hidden cursor-pointer group hover:border-border/80 transition-colors"
      onClick={onClick}
    >
      <div className="aspect-video overflow-hidden bg-muted">
        {src ? (
          <img
            src={src}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
            No preview
          </div>
        )}
      </div>
      <div className="px-3 py-2 flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
        {item.isFavorite && <Star className="size-3.5 text-amber-400 fill-amber-400 shrink-0" />}
      </div>
    </div>
  );
}
