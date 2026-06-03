"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Check, FolderPlus } from "lucide-react";
import { Sheet, SheetContent, SheetHeader } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCreateCollectionForm } from "@/hooks/useCreateCollectionForm";

interface CreateCollectionDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateCollectionDrawer({ open, onOpenChange }: CreateCollectionDrawerProps) {
  const router = useRouter();

  const form = useCreateCollectionForm(() => {
    onOpenChange(false);
    router.refresh();
  });

  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto p-0">
        <div className="flex flex-col h-full">
          <SheetHeader className="px-5 pt-5 pb-4 border-b border-border gap-3">
            <div className="flex items-center gap-3 pr-8">
              <div className="size-9 rounded-md bg-indigo-500/15 flex items-center justify-center shrink-0">
                <FolderPlus className="size-4 text-indigo-400" />
              </div>
              <input
                className="flex-1 text-base font-semibold bg-transparent border-b border-border focus:outline-none focus:border-primary"
                value={form.name}
                onChange={(e) => form.setName(e.target.value)}
                placeholder="Collection name"
                autoFocus
              />
            </div>
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
              onClick={form.save}
              disabled={form.saving || !form.name.trim()}
            >
              <Check className="size-3.5" />
              {form.saving ? "Saving…" : "Create"}
            </Button>
          </div>

          <div className="flex flex-col gap-4 p-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Description
              </label>
              <Textarea
                value={form.description}
                onChange={(e) => form.setDescription(e.target.value)}
                placeholder="Optional description…"
                className="resize-none text-sm min-h-25"
              />
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
