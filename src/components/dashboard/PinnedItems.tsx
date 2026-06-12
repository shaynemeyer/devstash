"use client";

import { useState } from "react";
import { Pin } from "lucide-react";
import { ItemWithMeta } from "@/lib/db/items";
import { ItemDrawer } from "@/components/items/ItemDrawer";
import { ItemListRow } from "@/components/items/ItemListRow";

interface PinnedItemsProps {
  items: ItemWithMeta[];
  isPro?: boolean;
}

export function PinnedItems({ items, isPro }: PinnedItemsProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  if (items.length === 0) return null;

  function openDrawer(id: string) {
    setSelectedId(id);
    setDrawerOpen(true);
  }

  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <Pin className="size-3.5 text-muted-foreground" />
        <h2 className="text-sm font-semibold text-foreground">Pinned</h2>
      </div>
      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <ItemListRow
            key={item.id}
            item={item}
            showTags
            onClick={() => openDrawer(item.id)}
          />
        ))}
      </div>
      <ItemDrawer itemId={selectedId} open={drawerOpen} onOpenChange={setDrawerOpen} isPro={isPro} />
    </section>
  );
}
