"use client";

import Link from "next/link";
import {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  Link as LinkIcon,
  Star,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from "lucide-react";
import { mockItemTypes, mockTypeCounts, mockCollections, mockUser } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const ICON_MAP = {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  Link: LinkIcon,
};

const TYPE_SLUGS: Record<string, string> = {
  type_snippet: "snippets",
  type_prompt: "prompts",
  type_command: "commands",
  type_note: "notes",
  type_file: "files",
  type_image: "images",
  type_link: "links",
};

const favoriteCollections = mockCollections.filter((c) => c.isFavorite);
const recentCollections = mockCollections.filter((c) => !c.isFavorite);

interface SidebarInnerProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  onClose?: () => void;
}

function SidebarInner({ collapsed, onToggleCollapse, onClose }: SidebarInnerProps) {
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
          {mockItemTypes.map((type) => {
            const Icon = ICON_MAP[type.icon as keyof typeof ICON_MAP];
            const count = mockTypeCounts[type.id] ?? 0;
            const slug = TYPE_SLUGS[type.id];
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
                    <span className="text-xs text-muted-foreground tabular-nums">{count}</span>
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
            <p className="text-xs text-muted-foreground/70 px-2 mb-1">Favorites</p>
            <div className="space-y-0.5 mb-3">
              {favoriteCollections.map((col) => (
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

            {/* Recent */}
            <p className="text-xs text-muted-foreground/70 px-2 mb-1">All Collections</p>
            <div className="space-y-0.5">
              {recentCollections.map((col) => (
                <Link
                  key={col.id}
                  href={`/collections/${col.id}`}
                  onClick={onClose}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
                >
                  <span
                    className="size-3.5 shrink-0 rounded-sm"
                    style={{ backgroundColor: col.dominantColor + "55" }}
                  />
                  <span className="flex-1 truncate">{col.name}</span>
                  <span className="text-xs text-muted-foreground tabular-nums">{col.itemCount}</span>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}

      {collapsed && <div className="flex-1" />}

      {/* User area */}
      <div className={cn("p-3 border-t border-sidebar-border shrink-0", collapsed && "flex justify-center")}>
        <div className={cn("flex items-center gap-2.5", collapsed && "justify-center")}>
          <div className="size-7 rounded-full bg-indigo-600 flex items-center justify-center shrink-0 text-white text-xs font-bold uppercase">
            {mockUser.name.charAt(0)}
          </div>
          {!collapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-sidebar-foreground truncate">{mockUser.name}</p>
                <p className="text-xs text-muted-foreground truncate">{mockUser.email}</p>
              </div>
              <button
                className="text-muted-foreground hover:text-sidebar-foreground p-1 rounded-md hover:bg-sidebar-accent"
                aria-label="Settings"
              >
                <Settings className="size-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({ collapsed, onToggleCollapse, mobileOpen, onMobileClose }: SidebarProps) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col shrink-0 border-r border-sidebar-border transition-all duration-200",
          collapsed ? "w-14" : "w-52"
        )}
      >
        <SidebarInner collapsed={collapsed} onToggleCollapse={onToggleCollapse} />
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
            <SidebarInner collapsed={false} onToggleCollapse={onToggleCollapse} onClose={onMobileClose} />
          </aside>
        </div>
      )}
    </>
  );
}
