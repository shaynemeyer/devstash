import { Search, Plus, FolderPlus, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function BrandLogo() {
  return (
    <div className="flex items-center gap-2">
      <div className="size-7 rounded-md bg-indigo-600 flex items-center justify-center shrink-0">
        <span className="text-white text-sm font-bold leading-none">S</span>
      </div>
      <span className="text-foreground font-semibold text-base tracking-tight">DevStash</span>
    </div>
  );
}

interface TopBarProps {
  onMobileMenuClick?: () => void;
}

export function TopBar({ onMobileMenuClick }: TopBarProps) {
  return (
    <header className="flex items-center px-4 h-12 border-b border-border bg-background shrink-0">
      <div className="w-52 shrink-0 flex items-center gap-2">
        <button
          className="md:hidden text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-accent"
          onClick={onMobileMenuClick}
          aria-label="Open menu"
        >
          <Menu className="size-4" />
        </button>
        <BrandLogo />
      </div>
      <div className="flex-1 flex justify-center">
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search items..."
            className="pl-9 pr-14 bg-muted/40 border-border text-sm"
            readOnly
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
            ⌘K
          </kbd>
        </div>
      </div>
      <div className="flex items-center gap-2 w-52 justify-end shrink-0">
        <Button variant="outline" size="sm" className="text-xs">
          <FolderPlus className="size-3.5 mr-1.5" />
          New Collection
        </Button>
        <Button size="sm" className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white border-0">
          <Plus className="size-3.5 mr-1.5" />
          New Item
        </Button>
      </div>
    </header>
  );
}
