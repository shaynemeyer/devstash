import Link from "next/link";
import { Search, Plus, FolderPlus, Menu, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function BrandLogo() {
  return (
    <div className="flex items-center gap-2">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none" width={24} height={24} aria-label="DevStash" role="img">
        <polygon points="28,8 16,14 16,26 28,20" fill="#1e40af" />
        <polygon points="4,8 16,14 16,26 4,20" fill="#2563eb" />
        <polygon points="16,2 28,8 16,14 4,8" fill="#60a5fa" />
        <polygon points="14.5,2.75 17.5,2.75 17.5,13.25 14.5,13.25" fill="white" opacity="0.22" />
      </svg>
      <span className="font-semibold text-base tracking-tight bg-linear-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent hidden sm:block">DevStash</span>
    </div>
  );
}

interface TopBarProps {
  onMobileMenuClick?: () => void;
  onNewItem?: () => void;
  onNewCollection?: () => void;
  onSearchClick?: () => void;
}

export function TopBar({ onMobileMenuClick, onNewItem, onNewCollection, onSearchClick }: TopBarProps) {
  return (
    <header className="flex items-center px-4 h-12 border-b border-border bg-background shrink-0 gap-2">
      <div className="shrink-0 flex items-center gap-2">
        <button
          className="md:hidden text-muted-foreground hover:text-foreground p-2 rounded-md hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onClick={onMobileMenuClick}
          aria-label="Open menu"
        >
          <Menu className="size-4" />
        </button>
        <BrandLogo />
      </div>

      <div className="flex-1 flex justify-center mx-2">
        <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search items... ⌘K"
            className="pl-9 pr-14 bg-muted/40 border-border text-sm cursor-pointer"
            readOnly
            onClick={onSearchClick}
            aria-label="Search items"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none hidden sm:block">
            ⌘K
          </kbd>
        </div>
      </div>

      <div className="shrink-0 flex items-center gap-2">
        <Link
          href="/favorites"
          className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Favorites"
        >
          <Star className="size-4" />
        </Link>
        <Button
          variant="outline"
          size="sm"
          className="text-xs focus-visible:ring-2 focus-visible:ring-ring"
          onClick={onNewCollection}
          aria-label="New Collection"
        >
          <FolderPlus className="size-3.5 sm:mr-1.5" />
          <span className="hidden sm:inline">New Collection</span>
        </Button>
        <Button
          size="sm"
          className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white border-0 focus-visible:ring-2 focus-visible:ring-ring"
          onClick={onNewItem}
          aria-label="New Item"
        >
          <Plus className="size-3.5 sm:mr-1.5" />
          <span className="hidden sm:inline">New Item</span>
        </Button>
      </div>
    </header>
  );
}
