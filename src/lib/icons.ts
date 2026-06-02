import { Code, Sparkles, Terminal, StickyNote, File, Image, Link } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  Link,
};

export function getIcon(name: string): LucideIcon {
  return ICON_MAP[name] ?? Code;
}
