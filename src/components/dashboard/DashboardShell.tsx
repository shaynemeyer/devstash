"use client";

import { useState, useEffect } from "react";
import { TopBar } from "./TopBar";
import { Sidebar } from "./Sidebar";
import { CreateItemDrawer } from "@/components/items/CreateItemDrawer";
import { CreateCollectionDrawer } from "@/components/collections/CreateCollectionDrawer";
import { CommandPalette } from "@/components/search/CommandPalette";
import { ItemDrawer } from "@/components/items/ItemDrawer";
import { getSearchData } from "@/actions/search";
import { getEditorPreferences } from "@/actions/settings";
import { EditorPreferencesProvider } from "@/contexts/EditorPreferencesContext";
import type { SearchData } from "@/actions/search";
import type { ItemTypeWithCount } from "@/lib/db/items";
import type { SidebarCollection } from "@/lib/db/collections";
import type { EditorPreferences } from "@/lib/validations/settings";

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
  isPro: boolean;
}

export function DashboardShell({ children, itemTypes, collections, user, isPro }: DashboardShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [createCollectionOpen, setCreateCollectionOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [searchData, setSearchData] = useState<SearchData>({ items: [], collections: [] });
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [itemDrawerOpen, setItemDrawerOpen] = useState(false);
  const [editorPreferences, setEditorPreferences] = useState<EditorPreferences | null>(null);

  useEffect(() => {
    getSearchData().then(setSearchData);
    getEditorPreferences().then(setEditorPreferences);
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  function handleSelectItem(itemId: string) {
    setSelectedItemId(itemId);
    setItemDrawerOpen(true);
  }

  return (
    <EditorPreferencesProvider initialPreferences={editorPreferences}>
    <div className="flex flex-col h-screen bg-background">
      <TopBar
        onMobileMenuClick={() => setMobileOpen(true)}
        onNewItem={() => setCreateOpen(true)}
        onNewCollection={() => setCreateCollectionOpen(true)}
        onSearchClick={() => setPaletteOpen(true)}
      />
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
      <CreateItemDrawer
        open={createOpen}
        onOpenChange={setCreateOpen}
        itemTypes={itemTypes}
        defaultTypeId={itemTypes.find((t) => t.name.toLowerCase() === "snippet")?.id ?? ""}
        isPro={isPro}
      />
      <CreateCollectionDrawer
        open={createCollectionOpen}
        onOpenChange={setCreateCollectionOpen}
      />
      <CommandPalette
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        searchData={searchData}
        onSelectItem={handleSelectItem}
      />
      <ItemDrawer
        itemId={selectedItemId}
        open={itemDrawerOpen}
        onOpenChange={setItemDrawerOpen}
        isPro={isPro}
      />
    </div>
    </EditorPreferencesProvider>
  );
}
