"use client";

import { FileListRow } from "@/components/items/FileListRow";
import { ItemDrawer } from "@/components/items/ItemDrawer";
import { useItemDrawerSelection } from "@/hooks/useItemDrawerSelection";
import { ItemWithMeta } from "@/lib/db/items";

interface FileListProps {
  items: ItemWithMeta[];
  isPro?: boolean;
}

export function FileList({ items, isPro }: FileListProps) {
  const { selectedId, drawerOpen, openDrawer, setDrawerOpen } = useItemDrawerSelection();

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-12 text-center">
        <p className="text-muted-foreground text-sm">No files yet.</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-xl border border-border bg-card divide-y divide-border overflow-hidden">
        {items.map((item) => (
          <FileListRow key={item.id} item={item} onClick={() => openDrawer(item.id)} />
        ))}
      </div>
      <ItemDrawer itemId={selectedId} open={drawerOpen} onOpenChange={setDrawerOpen} isPro={isPro} />
    </>
  );
}
