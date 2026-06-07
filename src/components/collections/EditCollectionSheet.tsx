"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { updateCollection } from "@/actions/collections";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collection: { id: string; name: string; description: string | null };
}

export function EditCollectionSheet({ open, onOpenChange, collection }: Props) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col gap-0 p-0">
        <SheetHeader className="px-6 py-4 border-b border-border">
          <SheetTitle>Edit Collection</SheetTitle>
        </SheetHeader>
        {open && <CollectionForm collection={collection} onOpenChange={onOpenChange} />}
      </SheetContent>
    </Sheet>
  );
}

function CollectionForm({
  collection,
  onOpenChange,
}: {
  collection: { id: string; name: string; description: string | null };
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [name, setName] = useState(collection.name);
  const [description, setDescription] = useState(collection.description ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    const result = await updateCollection(collection.id, {
      name,
      description: description || null,
    });
    setSaving(false);

    if (!result.success) {
      toast.error(result.error ?? "Failed to update collection");
      return;
    }

    toast.success("Collection updated");
    onOpenChange(false);
    router.refresh();
  }

  return (
    <>
      <div className="flex flex-col gap-4 px-6 py-6 flex-1">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="col-name">Name</Label>
          <Input
            id="col-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Collection name"
            maxLength={100}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="col-desc">Description</Label>
          <Textarea
            id="col-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description"
            rows={3}
          />
        </div>
      </div>
      <div className="px-6 py-4 border-t border-border flex justify-end gap-2">
        <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={saving || !name.trim()}>
          {saving ? "Saving…" : "Save"}
        </Button>
      </div>
    </>
  );
}
