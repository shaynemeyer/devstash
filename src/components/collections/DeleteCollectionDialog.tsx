"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteCollection } from "@/actions/collections";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collection: { id: string; name: string };
  redirectAfterDelete?: boolean;
}

export function DeleteCollectionDialog({
  open,
  onOpenChange,
  collection,
  redirectAfterDelete = false,
}: Props) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    const result = await deleteCollection(collection.id);
    setDeleting(false);

    if (!result.success) {
      toast.error(result.error ?? "Failed to delete collection");
      return;
    }

    toast.success("Collection deleted");
    onOpenChange(false);

    if (redirectAfterDelete) {
      router.push("/collections");
    } else {
      router.refresh();
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete &quot;{collection.name}&quot;?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the collection. Items will not be deleted.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleting ? "Deleting…" : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
