import { Package, FolderOpen, Heart, Star } from "lucide-react";
import { mockItems, mockCollections, mockTypeCounts } from "@/lib/mock-data";

const totalItems = Object.values(mockTypeCounts).reduce((a, b) => a + b, 0);
const totalCollections = mockCollections.length;
const favoriteItems = mockItems.filter((i) => i.isFavorite).length;
const favoriteCollections = mockCollections.filter((c) => c.isFavorite).length;

const stats = [
  { label: "Items", value: totalItems, icon: Package, color: "#3b82f6" },
  { label: "Collections", value: totalCollections, icon: FolderOpen, color: "#8b5cf6" },
  { label: "Favorite Items", value: favoriteItems, icon: Heart, color: "#ec4899" },
  { label: "Favorite Collections", value: favoriteCollections, icon: Star, color: "#f97316" },
];

export function StatsCards() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map(({ label, value, icon: Icon, color }) => (
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
