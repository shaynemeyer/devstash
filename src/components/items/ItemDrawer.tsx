"use client";

import { useEffect, useState } from "react";
import { Star, Pin, Copy, Pencil, Trash2, Calendar, FolderOpen, Tag } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { getIcon } from "@/lib/icons";
import type { ItemDetail } from "@/lib/db/items";

interface ItemDrawerProps {
  itemId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ItemDrawer({ itemId, open, onOpenChange }: ItemDrawerProps) {
  const [item, setItem] = useState<ItemDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !itemId) return;
    setLoading(true);
    setItem(null);
    fetch(`/api/items/${itemId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setItem(data))
      .finally(() => setLoading(false));
  }, [open, itemId]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto p-0">
        {loading && <DrawerSkeleton />}
        {!loading && item && <DrawerBody item={item} />}
      </SheetContent>
    </Sheet>
  );
}

function DrawerBody({ item }: { item: ItemDetail }) {
  const Icon = getIcon(item.typeIcon);
  const created = new Date(item.createdAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const updated = new Date(item.updatedAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  function copyContent() {
    const text = item.content ?? item.url ?? item.fileUrl ?? item.title;
    navigator.clipboard.writeText(text ?? "");
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <SheetHeader className="px-5 pt-5 pb-4 border-b border-border gap-3">
        <div className="flex items-center gap-3 pr-8">
          <div
            className="size-9 rounded-md flex items-center justify-center shrink-0"
            style={{ backgroundColor: item.typeColor + "22" }}
          >
            <Icon className="size-4" style={{ color: item.typeColor }} />
          </div>
          <SheetTitle className="text-base font-semibold leading-tight">{item.title}</SheetTitle>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="text-xs px-2 py-0.5 rounded-md font-medium"
            style={{ backgroundColor: item.typeColor + "22", color: item.typeColor }}
          >
            {item.typeName}
          </span>
          {item.language && (
            <span className="text-xs px-2 py-0.5 rounded-md font-medium bg-muted text-muted-foreground">
              {item.language}
            </span>
          )}
        </div>
      </SheetHeader>

      {/* Action bar */}
      <div className="flex items-center gap-1 px-4 py-2 border-b border-border">
        <Button
          variant="ghost"
          size="sm"
          className={`gap-1.5 text-xs ${item.isFavorite ? "text-amber-400" : "text-muted-foreground"}`}
        >
          <Star className={`size-3.5 ${item.isFavorite ? "fill-amber-400" : ""}`} />
          Favorite
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={`gap-1.5 text-xs ${item.isPinned ? "text-foreground" : "text-muted-foreground"}`}
        >
          <Pin className="size-3.5" />
          Pin
        </Button>
        <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground" onClick={copyContent}>
          <Copy className="size-3.5" />
          Copy
        </Button>
        <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground">
          <Pencil className="size-3.5" />
          Edit
        </Button>
        <div className="flex-1" />
        <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-destructive">
          <Trash2 className="size-3.5" />
          <span className="sr-only">Delete</span>
        </Button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
        {item.description && (
          <section>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
              Description
            </p>
            <p className="text-sm text-foreground">{item.description}</p>
          </section>
        )}

        {item.content && (
          <section>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
              Content
            </p>
            <pre className="rounded-lg bg-muted p-4 text-xs font-mono overflow-x-auto whitespace-pre-wrap break-all leading-relaxed">
              <code>{item.content}</code>
            </pre>
          </section>
        )}

        {item.url && (
          <section>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
              URL
            </p>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary underline-offset-2 hover:underline break-all"
            >
              {item.url}
            </a>
          </section>
        )}

        {item.tags.length > 0 && (
          <section>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Tag className="size-3 text-muted-foreground" />
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Tags</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-0.5 rounded-md"
                  style={{ backgroundColor: item.typeColor + "22", color: item.typeColor }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </section>
        )}

        {item.collections.length > 0 && (
          <section>
            <div className="flex items-center gap-1.5 mb-1.5">
              <FolderOpen className="size-3 text-muted-foreground" />
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Collections
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {item.collections.map((col) => (
                <span key={col} className="text-xs px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                  {col}
                </span>
              ))}
            </div>
          </section>
        )}

        <section>
          <div className="flex items-center gap-1.5 mb-2">
            <Calendar className="size-3 text-muted-foreground" />
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Details</p>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Created</span>
              <span className="text-foreground">{created}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Updated</span>
              <span className="text-foreground">{updated}</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function DrawerSkeleton() {
  return (
    <div className="flex flex-col h-full animate-pulse">
      <div className="px-5 pt-5 pb-4 border-b border-border space-y-3">
        <div className="flex items-center gap-3 pr-8">
          <div className="size-9 rounded-md bg-muted shrink-0" />
          <div className="h-5 bg-muted rounded w-48" />
        </div>
        <div className="flex gap-2">
          <div className="h-5 bg-muted rounded w-16" />
          <div className="h-5 bg-muted rounded w-20" />
        </div>
      </div>
      <div className="flex gap-2 px-4 py-2 border-b border-border">
        {[80, 60, 64, 56].map((w) => (
          <div key={w} className="h-7 bg-muted rounded" style={{ width: w }} />
        ))}
      </div>
      <div className="px-5 py-4 space-y-5">
        <div className="space-y-2">
          <div className="h-3 bg-muted rounded w-20" />
          <div className="h-4 bg-muted rounded w-full" />
          <div className="h-4 bg-muted rounded w-3/4" />
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-muted rounded w-16" />
          <div className="h-32 bg-muted rounded" />
        </div>
      </div>
    </div>
  );
}
