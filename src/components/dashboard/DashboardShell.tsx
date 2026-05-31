"use client";

import { useState } from "react";
import { TopBar } from "./TopBar";
import { Sidebar } from "./Sidebar";
import { CreateItemDrawer } from "@/components/items/CreateItemDrawer";
import type { ItemTypeWithCount } from "@/lib/db/items";
import type { SidebarCollection } from "@/lib/db/collections";

interface ShellUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

interface DashboardShellProps {
  children: React.ReactNode;
  itemTypes: ItemTypeWithCount[];
  collections: SidebarCollection[];
  user: ShellUser;
}

export function DashboardShell({ children, itemTypes, collections, user }: DashboardShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen bg-background">
      <TopBar onMobileMenuClick={() => setMobileOpen(true)} onNewItem={() => setCreateOpen(true)} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((v) => !v)}
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
          itemTypes={itemTypes}
          collections={collections}
          user={user}
        />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
      <CreateItemDrawer open={createOpen} onOpenChange={setCreateOpen} itemTypes={itemTypes} />
    </div>
  );
}
