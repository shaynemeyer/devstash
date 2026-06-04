"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Star, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getIcon } from "@/lib/icons";
import { CollectionWithMeta } from "@/lib/db/collections";
import { toggleFavoriteCollection } from "@/actions/collections";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EditCollectionSheet } from "./EditCollectionSheet";
import { DeleteCollectionDialog } from "./DeleteCollectionDialog";

interface Props {
  collection: CollectionWithMeta;
}

export function CollectionCard({ collection: col }: Props) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(col.isFavorite);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleToggleFavorite() {
    startTransition(async () => {
      const prev = isFavorite;
      setIsFavorite(!prev);
      const result = await toggleFavoriteCollection(col.id, prev);
      if (!result.success) {
        setIsFavorite(prev);
        toast.error("Failed to update favorite");
      } else {
        router.refresh();
      }
    });
  }

  return (
    <>
      <div className="group relative rounded-xl border border-border bg-card flex items-stretch overflow-hidden hover:bg-card/80 transition-colors">
        <div className="w-1 shrink-0" style={{ backgroundColor: col.dominantColor }} />
        <Link href={`/collections/${col.id}`} className="flex flex-col gap-2 p-4 flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            {isFavorite && (
              <Star className="size-3.5 text-amber-400 fill-amber-400 shrink-0" />
            )}
            <p className="text-sm font-semibold text-foreground truncate">{col.name}</p>
          </div>
          <p className="text-xs text-muted-foreground">{col.itemCount} {col.itemCount === 1 ? "item" : "items"}</p>
          <p className="text-xs text-muted-foreground line-clamp-2 flex-1">{col.description}</p>
          <div className="flex items-center gap-1.5 pt-1">
            {col.typeIcons.slice(0, 4).map(({ icon, color }) => {
              const Icon = getIcon(icon);
              return <Icon key={icon} className="size-3.5" style={{ color }} />;
            })}
          </div>
        </Link>

        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger
              className="inline-flex items-center justify-center size-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <MoreHorizontal className="size-4" />
              <span className="sr-only">Collection options</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setEditOpen(true)}>
                <Pencil className="size-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setDeleteOpen(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="size-4 mr-2" />
                Delete
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleToggleFavorite} disabled={pending}>
                <Star className={`size-4 mr-2 ${isFavorite ? "text-amber-400 fill-amber-400" : ""}`} />
                {isFavorite ? "Unfavorite" : "Favorite"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <EditCollectionSheet
        open={editOpen}
        onOpenChange={setEditOpen}
        collection={col}
      />
      <DeleteCollectionDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        collection={col}
      />
    </>
  );
}
