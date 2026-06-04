"use client";

import { useState } from "react";
import Link from "next/link";
import { Folder } from "lucide-react";
import { ItemDrawer } from "@/components/items/ItemDrawer";
import { getIcon } from "@/lib/icons";
import type { FavoriteItem, FavoriteCollection } from "@/lib/db/favorites";

interface FavoritesListProps {
  items: FavoriteItem[];
  collections: FavoriteCollection[];
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function FavoritesList({ items, collections }: FavoritesListProps) {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  function openItem(id: string) {
    setSelectedItemId(id);
    setDrawerOpen(true);
  }

  return (
    <>
      <div className="space-y-8">
        <FavoritesSection title="Items" count={items.length}>
          {items.map((item) => {
            const Icon = getIcon(item.typeIcon);
            return (
              <button
                key={item.id}
                onClick={() => openItem(item.id)}
                className="w-full flex items-center gap-3 px-3 py-1.5 rounded hover:bg-muted/50 transition-colors text-left group"
              >
                <Icon className="size-3.5 shrink-0" style={{ color: item.typeColor }} />
                <span className="flex-1 text-sm text-foreground truncate font-mono">{item.title}</span>
                <span
                  className="text-[10px] font-mono px-1.5 py-0.5 rounded shrink-0 opacity-70"
                  style={{ color: item.typeColor, backgroundColor: `${item.typeColor}1a` }}
                >
                  {item.typeName}
                </span>
                <span className="text-[11px] text-muted-foreground font-mono shrink-0 w-24 text-right">
                  {formatDate(item.updatedAt)}
                </span>
              </button>
            );
          })}
        </FavoritesSection>

        <FavoritesSection title="Collections" count={collections.length}>
          {collections.map((col) => (
            <Link
              key={col.id}
              href={`/collections/${col.id}`}
              className="flex items-center gap-3 px-3 py-1.5 rounded hover:bg-muted/50 transition-colors group"
            >
              <Folder className="size-3.5 shrink-0 text-muted-foreground" />
              <span className="flex-1 text-sm text-foreground truncate font-mono">{col.name}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded shrink-0 opacity-70 text-muted-foreground bg-muted">
                Collection
              </span>
              <span className="text-[11px] text-muted-foreground font-mono shrink-0 w-24 text-right">
                {formatDate(col.updatedAt)}
              </span>
            </Link>
          ))}
        </FavoritesSection>
      </div>

      <ItemDrawer
        itemId={selectedItemId}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </>
  );
}

function FavoritesSection({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  if (count === 0) return null;

  return (
    <section className="space-y-1">
      <div className="flex items-center gap-2 px-3 pb-1 border-b border-border mb-2">
        <span className="text-xs font-mono font-semibold text-muted-foreground uppercase tracking-widest">
          {title}
        </span>
        <span className="text-xs font-mono text-muted-foreground">({count})</span>
      </div>
      {children}
    </section>
  );
}
