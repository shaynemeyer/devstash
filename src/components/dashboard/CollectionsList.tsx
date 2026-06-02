"use client";

import Link from "next/link";
import { Star } from "lucide-react";
import type { SidebarCollection } from "@/lib/db/collections";

interface CollectionsListProps {
  collections: SidebarCollection[];
  onClose?: () => void;
}

export function CollectionsList({ collections, onClose }: CollectionsListProps) {
  const favorites = collections.filter((c) => c.isFavorite);
  const rest = collections.filter((c) => !c.isFavorite);

  return (
    <div className="px-2 pt-3 pb-2 flex-1 overflow-y-auto min-h-0">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">
        Collections
      </p>

      {favorites.length > 0 && (
        <>
          <p className="text-xs text-muted-foreground/70 px-2 mb-1">Favorites</p>
          <div className="space-y-0.5 mb-3">
            {favorites.map((col) => (
              <Link
                key={col.id}
                href={`/collections/${col.id}`}
                onClick={onClose}
                className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
              >
                <Star className="size-3.5 shrink-0 text-amber-400 fill-amber-400" />
                <span className="flex-1 truncate">{col.name}</span>
                <span className="text-xs text-muted-foreground tabular-nums">{col.itemCount}</span>
              </Link>
            ))}
          </div>
        </>
      )}

      {rest.length > 0 && (
        <>
          <p className="text-xs text-muted-foreground/70 px-2 mb-1">All Collections</p>
          <div className="space-y-0.5">
            {rest.map((col) => (
              <Link
                key={col.id}
                href={`/collections/${col.id}`}
                onClick={onClose}
                className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
              >
                <span
                  className="size-3.5 shrink-0 rounded-full"
                  style={{ backgroundColor: col.dominantColor + "99" }}
                />
                <span className="flex-1 truncate">{col.name}</span>
                <span className="text-xs text-muted-foreground tabular-nums">{col.itemCount}</span>
              </Link>
            ))}
          </div>
        </>
      )}

      <Link
        href="/collections"
        onClick={onClose}
        className="flex items-center px-2 py-1.5 mt-2 text-xs text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent rounded-md transition-colors"
      >
        View all collections →
      </Link>
    </div>
  );
}
