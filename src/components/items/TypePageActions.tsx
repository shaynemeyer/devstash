"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateItemDrawer } from "@/components/items/CreateItemDrawer";
import type { ItemTypeWithCount } from "@/lib/db/items";

interface TypePageActionsProps {
  label: string;
  count: number;
  itemTypes: ItemTypeWithCount[];
  defaultTypeId: string;
}

export function TypePageActions({ label, count, itemTypes, defaultTypeId }: TypePageActionsProps) {
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{label}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {count} {count === 1 ? "item" : "items"}
          </p>
        </div>
        <Button
          size="sm"
          className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white border-0 shrink-0"
          onClick={() => setCreateOpen(true)}
        >
          <Plus className="size-3.5 mr-1.5" />
          New {label.replace(/s$/, "")}
        </Button>
      </div>
      <CreateItemDrawer
        open={createOpen}
        onOpenChange={setCreateOpen}
        itemTypes={itemTypes}
        defaultTypeId={defaultTypeId}
      />
    </>
  );
}
