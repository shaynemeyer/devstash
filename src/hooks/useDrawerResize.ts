"use client";

import { useRef, useState } from "react";

const DRAWER_WIDTH_KEY = "item-drawer-width";
const DEFAULT_WIDTH = 672;

export function useDrawerResize(
  key: string = DRAWER_WIDTH_KEY,
  defaultWidth: number = DEFAULT_WIDTH
): {
  width: number;
  handleResizeStart: (e: React.PointerEvent) => void;
} {
  const [width, setWidth] = useState<number>(() => {
    if (typeof window === "undefined") return defaultWidth;
    const stored = localStorage.getItem(key);
    return stored ? parseInt(stored, 10) : defaultWidth;
  });
  const widthRef = useRef(width);

  function handleResizeStart(e: React.PointerEvent) {
    e.preventDefault();

    function onMove(ev: PointerEvent) {
      const minWidth = Math.floor(window.innerWidth / 3);
      const maxWidth = Math.floor(window.innerWidth * 0.85);
      const newWidth = Math.min(maxWidth, Math.max(minWidth, window.innerWidth - ev.clientX));
      widthRef.current = newWidth;
      setWidth(newWidth);
    }

    function onUp() {
      localStorage.setItem(key, String(widthRef.current));
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    }

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  return { width, handleResizeStart };
}
