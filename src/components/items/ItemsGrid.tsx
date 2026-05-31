"use client";

import { useState } from "react";
import { ItemCard } from "@/components/items/ItemCard";
import { ItemDrawer } from "@/components/items/ItemDrawer";
import { ItemWithMeta } from "@/lib/db/items";

interface ItemsGridProps {
  items: ItemWithMeta[];
  emptyLabel: string;
}

export function ItemsGrid({ items, emptyLabel }: ItemsGridProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  function openDrawer(id: string) {
    setSelectedId(id);
    setDrawerOpen(true);
  }

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-12 text-center">
        <p className="text-muted-foreground text-sm">No {emptyLabel} yet.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map((item) => (
          <ItemCard key={item.id} item={item} onClick={() => openDrawer(item.id)} />
        ))}
      </div>
      <ItemDrawer itemId={selectedId} open={drawerOpen} onOpenChange={setDrawerOpen} />
    </>
  );
}
