import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { RecentCollections } from "@/components/dashboard/RecentCollections";
import { PinnedItems } from "@/components/dashboard/PinnedItems";
import { RecentItems } from "@/components/dashboard/RecentItems";
import { getRecentCollections } from "@/lib/db/collections";
import { getPinnedItems, getRecentItems, getDashboardStats } from "@/lib/db/items";
import { db } from "@/lib/db";

async function getDemoUserId(): Promise<string | null> {
  const user = await db.user.findUnique({
    where: { email: "demo@devstash.io" },
    select: { id: true },
  });
  return user?.id ?? null;
}

export default async function DashboardPage() {
  const userId = await getDemoUserId();

  const [collections, pinnedItems, recentItems, stats] = await Promise.all([
    userId ? getRecentCollections(userId) : Promise.resolve([]),
    userId ? getPinnedItems(userId) : Promise.resolve([]),
    userId ? getRecentItems(userId) : Promise.resolve([]),
    userId ? getDashboardStats(userId) : Promise.resolve({ totalItems: 0, totalCollections: 0, favoriteItems: 0, favoriteCollections: 0 }),
  ]);

  return (
    <DashboardShell>
      <div className="p-6 max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Your developer knowledge hub</p>
        </div>
        <StatsCards stats={stats} />
        <RecentCollections collections={collections} />
        <PinnedItems items={pinnedItems} />
        <RecentItems items={recentItems} />
      </div>
    </DashboardShell>
  );
}
