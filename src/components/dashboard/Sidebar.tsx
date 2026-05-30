"use client";

import Link from "next/link";
import { Star, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { getIcon } from "@/lib/icons";
import { SidebarUserArea } from "./SidebarUserArea";
import type { ItemTypeWithCount } from "@/lib/db/items";
import type { SidebarCollection } from "@/lib/db/collections";

interface SidebarUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

const PRO_TYPE_NAMES = new Set(["File", "Image"]);

function typeSlug(name: string): string {
  return name.toLowerCase() + "s";
}

interface SidebarInnerProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  onClose?: () => void;
  itemTypes: ItemTypeWithCount[];
  collections: SidebarCollection[];
  user: SidebarUser;
}

function SidebarInner({ collapsed, onToggleCollapse, onClose, itemTypes, collections, user }: SidebarInnerProps) {
  const favorites = collections.filter((c) => c.isFavorite);
  const rest = collections.filter((c) => !c.isFavorite);

  return (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground">
      {/* Header row */}
      <div
        className={cn(
          "flex items-center h-12 px-3 shrink-0 border-b border-sidebar-border",
          collapsed ? "justify-center" : "justify-end"
        )}
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
            {collapsed ? (
              <PanelLeftOpen className="size-4" />
            ) : (
              <PanelLeftClose className="size-4" />
            )}
          </button>
        )}
      </div>

      {/* Types */}
      <div className={cn("px-2 pt-3 pb-2", collapsed && "px-2")}>
        {!collapsed && (
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
                  collapsed && "justify-center px-0"
                )}
                title={collapsed ? `${type.name}s` : undefined}
              >
                <Icon className="size-4 shrink-0" style={{ color: type.color }} />
                {!collapsed && (
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

      {/* Collections */}
      {!collapsed && (
        <>
          <div className="mx-3 border-t border-sidebar-border" />
          <div className="px-2 pt-3 pb-2 flex-1 overflow-y-auto min-h-0">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">
              Collections
            </p>

            {/* Favorites */}
            {favorites.length > 0 && (
              <>
                <p className="text-xs text-muted-foreground/70 px-2 mb-1">Favorites</p>
                <div className="space-y-0.5 mb-3">
                  {favorites.map((col) => (
                    <Link
                      key={col.id}
                      href={`/collections/${col.id}`}
                      onClick={onClose}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
                    >
                      <Star className="size-3.5 shrink-0 text-amber-400 fill-amber-400" />
                      <span className="flex-1 truncate">{col.name}</span>
                      <span className="text-xs text-muted-foreground tabular-nums">{col.itemCount}</span>
                    </Link>
                  ))}
                </div>
              </>
            )}

            {/* All Collections */}
            {rest.length > 0 && (
              <>
                <p className="text-xs text-muted-foreground/70 px-2 mb-1">All Collections</p>
                <div className="space-y-0.5">
                  {rest.map((col) => (
                    <Link
                      key={col.id}
                      href={`/collections/${col.id}`}
                      onClick={onClose}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
                    >
                      <span
                        className="size-3.5 shrink-0 rounded-full"
                        style={{ backgroundColor: col.dominantColor + "99" }}
                      />
                      <span className="flex-1 truncate">{col.name}</span>
                      <span className="text-xs text-muted-foreground tabular-nums">{col.itemCount}</span>
                    </Link>
                  ))}
                </div>
              </>
            )}

            {/* View all collections link */}
            <Link
              href="/collections"
              onClick={onClose}
              className="flex items-center px-2 py-1.5 mt-2 text-xs text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent rounded-md transition-colors"
            >
              View all collections →
            </Link>
          </div>
        </>
      )}

      {collapsed && <div className="flex-1" />}

      {/* User area */}
      <SidebarUserArea
        name={user.name}
        email={user.email}
        image={user.image}
        collapsed={collapsed}
      />
    </div>
  );
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
        <SidebarInner
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
            <SidebarInner
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
