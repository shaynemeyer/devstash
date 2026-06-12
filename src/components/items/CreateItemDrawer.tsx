"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Check } from "lucide-react";
import { Sheet, SheetContent, SheetHeader } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { getIcon } from "@/lib/icons";
import { useCreateItemForm } from "@/hooks/useCreateItemForm";
import { useDrawerResize } from "@/hooks/useDrawerResize";
import { TypeBadge } from "@/components/items/TypeBadge";
import { ItemTypeSelector } from "@/components/items/ItemTypeSelector";
import { CreateItemForm } from "@/components/items/CreateItemForm";
import { getUserCollections } from "@/actions/collections";
import type { ItemTypeWithCount } from "@/lib/db/items";

const CREATABLE_TYPES = ["snippet", "prompt", "command", "note", "link", "file", "image"];
const FILE_TYPES = ["file", "image"];

interface CreateItemDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemTypes: ItemTypeWithCount[];
  defaultTypeId?: string;
  isPro?: boolean;
}

export function CreateItemDrawer({ open, onOpenChange, itemTypes, defaultTypeId, isPro = false }: CreateItemDrawerProps) {
  const { width: drawerWidth, handleResizeStart } = useDrawerResize();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full overflow-y-auto p-0"
        style={{ width: drawerWidth, maxWidth: "85vw", minWidth: "33vw" }}
      >
        <div
          className="absolute left-0 top-0 h-full w-1.5 cursor-col-resize z-50 hover:bg-primary/20 active:bg-primary/30 transition-colors"
          onPointerDown={handleResizeStart}
        />
        {open && (
          <DrawerContent
            onOpenChange={onOpenChange}
            itemTypes={itemTypes}
            defaultTypeId={defaultTypeId}
            isPro={isPro}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}

function DrawerContent({
  onOpenChange,
  itemTypes,
  defaultTypeId,
  isPro,
}: {
  onOpenChange: (open: boolean) => void;
  itemTypes: ItemTypeWithCount[];
  defaultTypeId?: string;
  isPro: boolean;
}) {
  const router = useRouter();
  const types = itemTypes.filter((t) => CREATABLE_TYPES.includes(t.name.toLowerCase()));

  const [selectedTypeId, setSelectedTypeId] = useState<string>(defaultTypeId ?? "");
  const selectedType = types.find((t) => t.id === selectedTypeId);
  const [collections, setCollections] = useState<{ id: string; name: string }[]>([]);

  const form = useCreateItemForm(() => {
    onOpenChange(false);
    router.refresh();
  });

  useEffect(() => {
    let cancelled = false;
    getUserCollections().then((data) => { if (!cancelled) setCollections(data); });
    return () => { cancelled = true; };
  }, []);

  const showFileUpload = selectedType ? FILE_TYPES.includes(selectedType.name.toLowerCase()) : false;
  const Icon = selectedType ? getIcon(selectedType.icon) : null;

  return (
    <div className="flex flex-col h-full">
      <SheetHeader className="px-5 pt-5 pb-4 border-b border-border gap-3">
        <div className="flex items-center gap-3 pr-8">
          {Icon && selectedType ? (
            <TypeBadge icon={Icon} color={selectedType.color} />
          ) : (
            <div className="size-9 rounded-md bg-muted shrink-0" />
          )}
          <input
            className="flex-1 text-base font-semibold bg-transparent border-b border-border focus:outline-none focus:border-primary"
            value={form.title}
            onChange={(e) => form.setTitle(e.target.value)}
            placeholder="Item title"
            autoFocus
          />
        </div>
        <ItemTypeSelector
          itemTypes={types}
          selectedTypeId={selectedTypeId}
          onChange={setSelectedTypeId}
        />
      </SheetHeader>

      <div className="flex items-center gap-1 px-4 py-2 border-b border-border">
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-xs text-muted-foreground"
          onClick={() => onOpenChange(false)}
        >
          <X className="size-3.5" />
          Cancel
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-xs text-primary"
          onClick={() => selectedType && form.save(selectedType)}
          disabled={form.saving || !form.title.trim() || !selectedTypeId || (showFileUpload && !form.uploadedFile)}
        >
          <Check className="size-3.5" />
          {form.saving ? "Saving…" : "Create"}
        </Button>
      </div>

      <CreateItemForm
        selectedType={selectedType}
        collections={collections}
        title={form.title}
        isPro={isPro}
        fields={{
          description: form.description,
          setDescription: form.setDescription,
          content: form.content,
          setContent: form.setContent,
          url: form.url,
          setUrl: form.setUrl,
          language: form.language,
          setLanguage: form.setLanguage,
          tagsInput: form.tagsInput,
          setTagsInput: form.setTagsInput,
          uploadedFile: form.uploadedFile,
          setUploadedFile: form.setUploadedFile,
          collectionIds: form.collectionIds,
          setCollectionIds: form.setCollectionIds,
        }}
      />
    </div>
  );
}
