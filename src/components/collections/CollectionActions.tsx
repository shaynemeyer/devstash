"use client";

import { useState } from "react";
import { Pencil, Trash2, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EditCollectionSheet } from "./EditCollectionSheet";
import { DeleteCollectionDialog } from "./DeleteCollectionDialog";

interface Props {
  collection: { id: string; name: string; description: string | null };
}

export function CollectionActions({ collection }: Props) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="size-8 text-muted-foreground hover:text-foreground"
          onClick={() => setEditOpen(true)}
        >
          <Pencil className="size-4" />
          <span className="sr-only">Edit collection</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-8 text-muted-foreground hover:text-destructive"
          onClick={() => setDeleteOpen(true)}
        >
          <Trash2 className="size-4" />
          <span className="sr-only">Delete collection</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-8 text-muted-foreground"
          disabled
          title="Coming soon"
        >
          <Heart className="size-4" />
          <span className="sr-only">Favorite collection</span>
        </Button>
      </div>

      <EditCollectionSheet
        open={editOpen}
        onOpenChange={setEditOpen}
        collection={collection}
      />
      <DeleteCollectionDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        collection={collection}
        redirectAfterDelete
      />
    </>
  );
}
