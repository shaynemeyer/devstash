import { Package, FolderOpen, Heart, Star } from "lucide-react";
import { DashboardStats } from "@/lib/db/items";

interface StatsCardsProps {
  stats: DashboardStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    { label: "Items", value: stats.totalItems, icon: Package, color: "#3b82f6" },
    { label: "Collections", value: stats.totalCollections, icon: FolderOpen, color: "#8b5cf6" },
    { label: "Favorite Items", value: stats.favoriteItems, icon: Heart, color: "#ec4899" },
    { label: "Favorite Collections", value: stats.favoriteCollections, icon: Star, color: "#f97316" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(({ label, value, icon: Icon, color }) => (
        <div
          key={label}
          className="rounded-xl border border-border bg-card p-4 flex items-center gap-3"
        >
          <div
            className="size-9 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: color + "22" }}
          >
            <Icon className="size-5" style={{ color }} />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground tabular-nums">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
