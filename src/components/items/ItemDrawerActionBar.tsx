"use client";

import { Star, Pin, Copy, Pencil, Trash2, X, Check, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { ItemDetail } from "@/lib/db/items";

const FILE_UPLOAD_TYPES = ["file", "image"];

interface ItemDrawerActionBarProps {
  item: ItemDetail;
  editMode: boolean;
  saving: boolean;
  deleting: boolean;
  titleEmpty: boolean;
  isPinned: boolean;
  pinPending: boolean;
  onEnterEdit: () => void;
  onCancelEdit: () => void;
  onSave: () => void;
  onDelete: () => void;
  onCopyContent: () => void;
  onTogglePin: () => void;
}

export function ItemDrawerActionBar({
  item,
  editMode,
  saving,
  deleting,
  titleEmpty,
  isPinned,
  pinPending,
  onEnterEdit,
  onCancelEdit,
  onSave,
  onDelete,
  onCopyContent,
  onTogglePin,
}: ItemDrawerActionBarProps) {
  const showFileSection = FILE_UPLOAD_TYPES.includes(item.typeName.toLowerCase());

  return (
    <div className="flex items-center gap-1 px-4 py-2 border-b border-border">
      {editMode ? (
        <>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-xs text-muted-foreground"
            onClick={onCancelEdit}
          >
            <X className="size-3.5" />
            Cancel
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-xs text-primary"
            onClick={onSave}
            disabled={saving || titleEmpty}
          >
            <Check className="size-3.5" />
            {saving ? "Saving…" : "Save"}
          </Button>
        </>
      ) : (
        <>
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
            className={`gap-1.5 text-xs ${isPinned ? "text-foreground" : "text-muted-foreground"}`}
            onClick={onTogglePin}
            disabled={pinPending}
          >
            <Pin className={`size-3.5 ${isPinned ? "fill-current" : ""}`} />
            {isPinned ? "Unpin" : "Pin"}
          </Button>
          {!showFileSection && (
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-xs text-muted-foreground"
              onClick={onCopyContent}
            >
              <Copy className="size-3.5" />
              Copy
            </Button>
          )}
          {showFileSection && item.fileUrl && (
            <a
              href={`/api/files/${item.fileUrl}`}
              download={item.fileName ?? true}
              className="inline-flex items-center gap-1.5 text-xs px-2 py-1.5 rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors font-medium h-8"
            >
              <Download className="size-3.5" />
              Download
            </a>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-xs text-muted-foreground"
            onClick={onEnterEdit}
          >
            <Pencil className="size-3.5" />
            Edit
          </Button>
          <div className="flex-1" />
          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-muted-foreground hover:text-destructive"
                  disabled={deleting}
                />
              }
            >
              <Trash2 className="size-3.5" />
              <span className="sr-only">Delete</span>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete item?</AlertDialogTitle>
                <AlertDialogDescription>
                  &ldquo;{item.title}&rdquo; will be permanently deleted. This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={onDelete}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </div>
  );
}
