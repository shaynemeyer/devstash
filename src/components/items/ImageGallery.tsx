"use client";

import { ImageThumbnailCard } from "@/components/items/ImageThumbnailCard";
import { ItemDrawer } from "@/components/items/ItemDrawer";
import { useItemDrawerSelection } from "@/hooks/useItemDrawerSelection";
import { ItemWithMeta } from "@/lib/db/items";

interface ImageGalleryProps {
  items: ItemWithMeta[];
  isPro?: boolean;
}

export function ImageGallery({ items, isPro }: ImageGalleryProps) {
  const { selectedId, drawerOpen, openDrawer, setDrawerOpen } = useItemDrawerSelection();

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-12 text-center">
        <p className="text-muted-foreground text-sm">No images yet.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map((item) => (
          <ImageThumbnailCard key={item.id} item={item} onClick={() => openDrawer(item.id)} />
        ))}
      </div>
      <ItemDrawer itemId={selectedId} open={drawerOpen} onOpenChange={setDrawerOpen} isPro={isPro} />
    </>
  );
}
