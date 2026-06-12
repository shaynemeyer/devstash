"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { LogOut, Settings, User } from "lucide-react";
import { UserAvatar } from "@/components/user/UserAvatar";
import { signOutAction } from "@/actions/auth";

interface SidebarUserAreaProps {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  collapsed: boolean;
}

export function SidebarUserArea({ name, email, image, collapsed }: SidebarUserAreaProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2.5 p-3 border-t border-sidebar-border hover:bg-sidebar-accent transition-colors"
        aria-label="User menu"
      >
        <UserAvatar name={name} image={image} size={28} />
        {!collapsed && (
          <div className="flex-1 min-w-0 text-left">
            <p className="text-xs font-medium text-sidebar-foreground truncate">{name ?? "User"}</p>
            <p className="text-xs text-muted-foreground truncate">{email ?? ""}</p>
          </div>
        )}
      </button>

      {open && (
        <div className="absolute bottom-full left-0 w-44 mb-1 bg-popover border border-border rounded-md shadow-lg py-1 z-50">
          <Link
            href="/profile"
            onClick={() => setOpen(false)}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-foreground hover:bg-accent transition-colors"
          >
            <User className="size-4 text-muted-foreground" />
            Profile
          </Link>
          <Link
            href="/settings"
            onClick={() => setOpen(false)}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-foreground hover:bg-accent transition-colors"
          >
            <Settings className="size-4 text-muted-foreground" />
            Settings
          </Link>
          <form action={signOutAction}>
            <button
              type="submit"
              className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-foreground hover:bg-accent transition-colors"
            >
              <LogOut className="size-4 text-muted-foreground" />
              Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
