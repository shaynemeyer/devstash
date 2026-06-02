"use client";

import { cn } from "@/lib/utils";
import { SidebarContent } from "./SidebarContent";
import type { ItemTypeWithCount } from "@/lib/db/items";
import type { SidebarCollection } from "@/lib/db/collections";

interface SidebarUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
  itemTypes: ItemTypeWithCount[];
  collections: SidebarCollection[];
  user: SidebarUser;
}

export function Sidebar({ collapsed, onToggleCollapse, mobileOpen, onMobileClose, itemTypes, collections, user }: SidebarProps) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col shrink-0 border-r border-sidebar-border transition-all duration-200",
          collapsed ? "w-14" : "w-52"
        )}
      >
        <SidebarContent
          collapsed={collapsed}
          onToggleCollapse={onToggleCollapse}
          itemTypes={itemTypes}
          collections={collections}
          user={user}
        />
      </aside>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={onMobileClose}
            aria-hidden="true"
          />
          <aside className="relative z-10 w-52 h-full shadow-xl">
            <SidebarContent
              collapsed={false}
              onToggleCollapse={onToggleCollapse}
              onClose={onMobileClose}
              itemTypes={itemTypes}
              collections={collections}
              user={user}
            />
          </aside>
        </div>
      )}
    </>
  );
}
