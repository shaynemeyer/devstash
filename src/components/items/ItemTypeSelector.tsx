"use client";

import { getIcon } from "@/lib/icons";
import type { ItemTypeWithCount } from "@/lib/db/items";

interface ItemTypeSelectorProps {
  itemTypes: ItemTypeWithCount[];
  selectedTypeId: string;
  onChange: (typeId: string) => void;
}

export function ItemTypeSelector({ itemTypes, selectedTypeId, onChange }: ItemTypeSelectorProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {itemTypes.map((t) => {
        const TIcon = getIcon(t.icon);
        const active = t.id === selectedTypeId;
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md font-medium transition-colors"
            style={
              active
                ? { backgroundColor: t.color + "33", color: t.color }
                : { backgroundColor: "transparent", color: "var(--muted-foreground)" }
            }
          >
            <TIcon className="size-3" />
            {t.name}
          </button>
        );
      })}
    </div>
  );
}
