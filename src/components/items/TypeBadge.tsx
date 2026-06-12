import type { LucideIcon } from "lucide-react";

interface TypeBadgeProps {
  icon: LucideIcon;
  color: string;
  size?: "sm" | "md";
  className?: string;
}

export function TypeBadge({ icon: Icon, color, size = "md", className = "" }: TypeBadgeProps) {
  const sizeClass = size === "sm" ? "size-8" : "size-9";

  return (
    <div
      className={`${sizeClass} rounded-md flex items-center justify-center shrink-0 ${className}`}
      style={{ backgroundColor: color + "22" }}
    >
      <Icon className="size-4" style={{ color }} />
    </div>
  );
}
