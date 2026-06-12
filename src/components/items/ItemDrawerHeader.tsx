"use client";

import { SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { getIcon } from "@/lib/icons";
import { TypeBadge } from "@/components/items/TypeBadge";
import type { ItemDetail } from "@/lib/db/items";

interface ItemDrawerHeaderProps {
  item: ItemDetail;
  editMode: boolean;
  title: string;
  onTitleChange: (value: string) => void;
}

export function ItemDrawerHeader({ item, editMode, title, onTitleChange }: ItemDrawerHeaderProps) {
  const Icon = getIcon(item.typeIcon);

  return (
    <SheetHeader className="px-5 pt-5 pb-4 border-b border-border gap-3">
      <div className="flex items-center gap-3 pr-8">
        <TypeBadge icon={Icon} color={item.typeColor} />
        {editMode ? (
          <input
            className="flex-1 text-lg font-semibold bg-transparent border-b border-border focus:outline-none focus:border-primary"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Title"
            autoFocus
          />
        ) : (
          <SheetTitle className="text-lg font-semibold leading-tight">{item.title}</SheetTitle>
        )}
      </div>
      <div className="flex items-center gap-2">
        <span
          className="text-xs px-2 py-0.5 rounded-md font-medium"
          style={{ backgroundColor: item.typeColor + "22", color: item.typeColor }}
        >
          {item.typeName}
        </span>
        {!editMode && item.language && (
          <span className="text-xs px-2 py-0.5 rounded-md font-medium bg-muted text-muted-foreground">
            {item.language}
          </span>
        )}
      </div>
    </SheetHeader>
  );
}
