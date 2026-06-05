"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useItemEdit } from "@/hooks/useItemEdit";
import { ItemDrawerHeader } from "@/components/items/ItemDrawerHeader";
import { ItemDrawerActionBar } from "@/components/items/ItemDrawerActionBar";
import { ItemDrawerContent } from "@/components/items/ItemDrawerContent";
import { getUserCollections } from "@/actions/collections";
import { toggleItemPin } from "@/actions/items";
import type { ItemDetail } from "@/lib/db/items";

interface ItemDrawerProps {
  itemId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ItemDrawer({ itemId, open, onOpenChange }: ItemDrawerProps) {
  const [item, setItem] = useState<ItemDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [collections, setCollections] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    if (!open || !itemId) return;
    setLoading(true);
    setItem(null);
    fetch(`/api/items/${itemId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setItem(data))
      .finally(() => setLoading(false));
    getUserCollections().then(setCollections);
  }, [open, itemId]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto p-0">
        {loading && <DrawerSkeleton />}
        {!loading && item && (
          <DrawerBody item={item} collections={collections} onItemChange={setItem} onClose={() => onOpenChange(false)} />
        )}
      </SheetContent>
    </Sheet>
  );
}

function DrawerBody({
  item,
  collections,
  onItemChange,
  onClose,
}: {
  item: ItemDetail;
  collections: { id: string; name: string }[];
  onItemChange: (item: ItemDetail) => void;
  onClose: () => void;
}) {
  const edit = useItemEdit(item, onItemChange, onClose);
  const [isPinned, setIsPinned] = useState(item.isPinned);
  const [pinPending, startPinTransition] = useTransition();
  const router = useRouter();

  function copyContent() {
    const text = item.content ?? item.url ?? item.fileUrl ?? item.title;
    navigator.clipboard.writeText(text ?? "");
  }

  function handleTogglePin() {
    startPinTransition(async () => {
      const prev = isPinned;
      setIsPinned(!prev);
      const result = await toggleItemPin(item.id, prev);
      if (!result.success) {
        setIsPinned(prev);
        toast.error("Failed to update pin");
      } else {
        toast.success(prev ? "Unpinned" : "Pinned");
        router.refresh();
      }
    });
  }

  return (
    <div className="flex flex-col h-full">
      <ItemDrawerHeader
        item={item}
        editMode={edit.editMode}
        title={edit.title}
        onTitleChange={edit.setTitle}
      />
      <ItemDrawerActionBar
        item={item}
        editMode={edit.editMode}
        saving={edit.saving}
        deleting={edit.deleting}
        titleEmpty={!edit.title.trim()}
        isPinned={isPinned}
        pinPending={pinPending}
        onEnterEdit={edit.enterEdit}
        onCancelEdit={edit.cancelEdit}
        onSave={edit.save}
        onDelete={edit.handleDelete}
        onCopyContent={copyContent}
        onTogglePin={handleTogglePin}
      />
      <ItemDrawerContent
        item={item}
        editMode={edit.editMode}
        description={edit.description}
        onDescriptionChange={edit.setDescription}
        content={edit.content}
        onContentChange={edit.setContent}
        language={edit.language}
        onLanguageChange={edit.setLanguage}
        url={edit.url}
        onUrlChange={edit.setUrl}
        tagsInput={edit.tagsInput}
        onTagsInputChange={edit.setTagsInput}
        uploadedFile={edit.uploadedFile}
        onUploadedFileChange={edit.setUploadedFile}
        collections={collections}
        collectionIds={edit.collectionIds}
        onCollectionIdsChange={edit.setCollectionIds}
      />
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
