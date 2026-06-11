"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Folder, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { ItemDrawer } from "@/components/items/ItemDrawer";
import { getIcon } from "@/lib/icons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FavoriteItem, FavoriteCollection } from "@/lib/db/favorites";

type SortField = "name" | "date" | "type";
type SortDir = "asc" | "desc";

interface FavoritesListProps {
  items: FavoriteItem[];
  collections: FavoriteCollection[];
  isPro?: boolean;
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function sortItems(items: FavoriteItem[], field: SortField, dir: SortDir): FavoriteItem[] {
  return [...items].sort((a, b) => {
    let cmp = 0;
    if (field === "name") cmp = a.title.localeCompare(b.title);
    else if (field === "date") cmp = new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    else if (field === "type") cmp = a.typeName.localeCompare(b.typeName);
    return dir === "asc" ? cmp : -cmp;
  });
}

function sortCollections(collections: FavoriteCollection[], field: SortField, dir: SortDir): FavoriteCollection[] {
  const effectiveField = field === "type" ? "name" : field;
  return [...collections].sort((a, b) => {
    let cmp = 0;
    if (effectiveField === "name") cmp = a.name.localeCompare(b.name);
    else if (effectiveField === "date") cmp = new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    return dir === "asc" ? cmp : -cmp;
  });
}

export function FavoritesList({ items, collections, isPro }: FavoritesListProps) {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  function openItem(id: string) {
    setSelectedItemId(id);
    setDrawerOpen(true);
  }

  function toggleDir() {
    setSortDir((d) => (d === "asc" ? "desc" : "asc"));
  }

  const sortedItems = useMemo(() => sortItems(items, sortField, sortDir), [items, sortField, sortDir]);
  const sortedCollections = useMemo(() => sortCollections(collections, sortField, sortDir), [collections, sortField, sortDir]);

  const DirIcon = sortDir === "asc" ? ArrowUp : ArrowDown;

  return (
    <>
      <div className="space-y-8">
        <div className="flex items-center gap-2 justify-end">
          <span className="text-xs font-mono text-muted-foreground">Sort by</span>
          <Select value={sortField} onValueChange={(v) => setSortField(v as SortField)}>
            <SelectTrigger className="h-7 w-28 text-xs font-mono">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date" className="text-xs font-mono">Date</SelectItem>
              <SelectItem value="name" className="text-xs font-mono">Name</SelectItem>
              <SelectItem value="type" className="text-xs font-mono">Type</SelectItem>
            </SelectContent>
          </Select>
          <button
            onClick={toggleDir}
            className="flex items-center justify-center size-7 rounded border border-input bg-background hover:bg-muted transition-colors"
            title={sortDir === "asc" ? "Ascending" : "Descending"}
          >
            {sortField === "date" && sortDir === "desc" ? (
              <ArrowUpDown className="size-3.5 text-muted-foreground" />
            ) : (
              <DirIcon className="size-3.5 text-muted-foreground" />
            )}
          </button>
        </div>

        <FavoritesSection title="Items" count={sortedItems.length}>
          {sortedItems.map((item) => {
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

        <FavoritesSection title="Collections" count={sortedCollections.length}>
          {sortedCollections.map((col) => (
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
        isPro={isPro}
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
