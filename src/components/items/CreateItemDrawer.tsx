"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Check } from "lucide-react";
import { Sheet, SheetContent, SheetHeader } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { getIcon } from "@/lib/icons";
import { useCreateItemForm } from "@/hooks/useCreateItemForm";
import { ItemTypeSelector } from "@/components/items/ItemTypeSelector";
import { CreateItemForm } from "@/components/items/CreateItemForm";
import type { ItemTypeWithCount } from "@/lib/db/items";

const CREATABLE_TYPES = ["Snippet", "Prompt", "Command", "Note", "Link", "File", "Image"];
const FILE_TYPES = ["File", "Image"];

interface CreateItemDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemTypes: ItemTypeWithCount[];
  defaultTypeId?: string;
}

export function CreateItemDrawer({ open, onOpenChange, itemTypes, defaultTypeId }: CreateItemDrawerProps) {
  const router = useRouter();
  const types = itemTypes.filter((t) => CREATABLE_TYPES.includes(t.name));

  const [selectedTypeId, setSelectedTypeId] = useState<string>(defaultTypeId ?? "");
  const selectedType = types.find((t) => t.id === selectedTypeId);

  const form = useCreateItemForm(() => {
    onOpenChange(false);
    router.refresh();
  });

  useEffect(() => {
    if (!open) {
      form.reset();
      setSelectedTypeId(defaultTypeId ?? "");
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleOpenChange(val: boolean) {
    onOpenChange(val);
  }

  const showFileUpload = selectedType ? FILE_TYPES.includes(selectedType.name) : false;
  const Icon = selectedType ? getIcon(selectedType.icon) : null;

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto p-0">
        <div className="flex flex-col h-full">
          <SheetHeader className="px-5 pt-5 pb-4 border-b border-border gap-3">
            <div className="flex items-center gap-3 pr-8">
              {Icon && selectedType ? (
                <div
                  className="size-9 rounded-md flex items-center justify-center shrink-0"
                  style={{ backgroundColor: selectedType.color + "22" }}
                >
                  <Icon className="size-4" style={{ color: selectedType.color }} />
                </div>
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
              onClick={() => handleOpenChange(false)}
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
            }}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
