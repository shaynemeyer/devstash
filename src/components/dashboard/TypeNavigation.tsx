"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { getIcon } from "@/lib/icons";
import type { ItemTypeWithCount } from "@/lib/db/items";

const PRO_TYPE_NAMES = new Set(["File", "Image"]);

function typeSlug(name: string): string {
  return name.toLowerCase() + "s";
}

interface TypeNavigationProps {
  itemTypes: ItemTypeWithCount[];
  isCollapsed: boolean;
  onClose?: () => void;
}

export function TypeNavigation({ itemTypes, isCollapsed, onClose }: TypeNavigationProps) {
  return (
    <div className={cn("px-2 pt-3 pb-2", isCollapsed && "px-2")}>
      {!isCollapsed && (
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 px-2">
          Types
        </p>
      )}
      <nav className="space-y-0.5">
        {itemTypes.map((type) => {
          const Icon = getIcon(type.icon);
          const slug = typeSlug(type.name);
          return (
            <Link
              key={type.id}
              href={`/items/${slug}`}
              onClick={onClose}
              className={cn(
                "flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors",
                isCollapsed && "justify-center px-0"
              )}
              title={isCollapsed ? `${type.name}s` : undefined}
            >
              <Icon className="size-4 shrink-0" style={{ color: type.color }} />
              {!isCollapsed && (
                <>
                  <span className="flex-1">{type.name}s</span>
                  {PRO_TYPE_NAMES.has(type.name) && (
                    <Badge variant="outline" className="h-4 px-1 text-[10px] font-semibold tracking-wide text-muted-foreground border-muted-foreground/30">
                      PRO
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground tabular-nums">{type.count}</span>
                </>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
