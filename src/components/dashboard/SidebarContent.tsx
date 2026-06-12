"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelLeftClose, PanelLeftOpen, X, LayoutDashboard, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { SidebarUserArea } from "./SidebarUserArea";
import { TypeNavigation } from "./TypeNavigation";
import { CollectionsList } from "./CollectionsList";
import type { ItemTypeWithCount } from "@/lib/db/items";
import type { SidebarCollection } from "@/lib/db/collections";

interface SidebarUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

interface SidebarContentProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  onClose?: () => void;
  itemTypes: ItemTypeWithCount[];
  collections: SidebarCollection[];
  user: SidebarUser;
}

export function SidebarContent({ collapsed, onToggleCollapse, onClose, itemTypes, collections, user }: SidebarContentProps) {
  const pathname = usePathname();
  return (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground">
      <div
        className={cn("flex items-center h-12 px-3 shrink-0 border-b border-sidebar-border", collapsed ? "justify-center" : "justify-end")}
      >
        {onClose ? (
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-accent"
            aria-label="Close sidebar"
          >
            <X className="size-4" />
          </button>
        ) : (
          <button
            onClick={onToggleCollapse}
            className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-accent"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
          </button>
        )}
      </div>

      <nav className={cn("px-2 pt-3 pb-1 space-y-0.5", collapsed && "px-2")}>
        <Link
          href="/dashboard"
          onClick={onClose}
          className={cn(
            "flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors",
            collapsed && "justify-center px-0",
            pathname === "/dashboard" && "bg-sidebar-accent text-sidebar-foreground font-medium"
          )}
          title={collapsed ? "Dashboard" : undefined}
        >
          <LayoutDashboard className="size-4 shrink-0" />
          {!collapsed && <span className="flex-1">Dashboard</span>}
        </Link>
        <Link
          href="/favorites"
          onClick={onClose}
          className={cn(
            "flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors",
            collapsed && "justify-center px-0",
            pathname === "/favorites" && "bg-sidebar-accent text-sidebar-foreground font-medium"
          )}
          title={collapsed ? "Favorites" : undefined}
        >
          <Star className="size-4 shrink-0" />
          {!collapsed && <span className="flex-1">Favorites</span>}
        </Link>
      </nav>

      {!collapsed && <div className="mx-3 border-t border-sidebar-border" />}

      <TypeNavigation itemTypes={itemTypes} isCollapsed={collapsed} onClose={onClose} />

      {!collapsed && (
        <>
          <div className="mx-3 border-t border-sidebar-border" />
          <CollectionsList collections={collections} onClose={onClose} />
        </>
      )}

      {collapsed && <div className="flex-1" />}

      <SidebarUserArea
        name={user.name}
        email={user.email}
        image={user.image}
        collapsed={collapsed}
      />
    </div>
  );
}
