"use client";

import { useState } from "react";

export function useItemDrawerSelection(): {
  selectedId: string | null;
  drawerOpen: boolean;
  openDrawer: (id: string) => void;
  setDrawerOpen: (open: boolean) => void;
} {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  function openDrawer(id: string) {
    setSelectedId(id);
    setDrawerOpen(true);
  }

  return { selectedId, drawerOpen, openDrawer, setDrawerOpen };
}
