"use client";

import { useRouter } from "next/navigation";
import { FolderOpen } from "lucide-react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { getIcon } from "@/lib/icons";
import type { SearchData } from "@/actions/search";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  searchData: SearchData;
  onSelectItem: (itemId: string) => void;
}

export function CommandPalette({
  open,
  onOpenChange,
  searchData,
  onSelectItem,
}: CommandPaletteProps) {
  const router = useRouter();

  function handleSelectItem(itemId: string) {
    onOpenChange(false);
    onSelectItem(itemId);
  }

  function handleSelectCollection(collectionId: string) {
    onOpenChange(false);
    router.push(`/collections/${collectionId}`);
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Search"
      description="Search items and collections"
    >
      <Command>
        <CommandInput placeholder="Search items and collections..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {searchData.items.length > 0 && (
            <CommandGroup heading="Items">
              {searchData.items.map((item) => {
                const Icon = getIcon(item.typeIcon);
                return (
                  <CommandItem
                    key={item.id}
                    value={`item-${item.id}-${item.title}-${item.typeName}`}
                    onSelect={() => handleSelectItem(item.id)}
                  >
                    <Icon className="size-4 shrink-0" style={{ color: item.typeColor }} />
                    <span className="flex-1 truncate">{item.title}</span>
                    <span className="text-xs text-muted-foreground">{item.typeName}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          )}
          {searchData.items.length > 0 && searchData.collections.length > 0 && (
            <CommandSeparator />
          )}
          {searchData.collections.length > 0 && (
            <CommandGroup heading="Collections">
              {searchData.collections.map((col) => (
                <CommandItem
                  key={col.id}
                  value={`collection-${col.id}-${col.name}`}
                  onSelect={() => handleSelectCollection(col.id)}
                >
                  <FolderOpen className="size-4 shrink-0 text-muted-foreground" />
                  <span className="flex-1 truncate">{col.name}</span>
                  <span className="text-xs text-muted-foreground">{col.itemCount} {col.itemCount === 1 ? "item" : "items"}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
