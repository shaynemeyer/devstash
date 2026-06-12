"use client";

import { useState } from "react";
import Link from "next/link";
import { ItemWithMeta } from "@/lib/db/items";
import { ItemDrawer } from "@/components/items/ItemDrawer";
import { ItemListRow } from "@/components/items/ItemListRow";

interface RecentItemsProps {
  items: ItemWithMeta[];
  isPro?: boolean;
}

export function RecentItems({ items, isPro }: RecentItemsProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  function openDrawer(id: string) {
    setSelectedId(id);
    setDrawerOpen(true);
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-foreground">Recent Items</h2>
        <Link href="/items" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
          View all
        </Link>
      </div>
      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <ItemListRow
            key={item.id}
            item={item}
            showFavorite
            showTypeBadge
            onClick={() => openDrawer(item.id)}
          />
        ))}
      </div>
      <ItemDrawer itemId={selectedId} open={drawerOpen} onOpenChange={setDrawerOpen} isPro={isPro} />
    </section>
  );
}
