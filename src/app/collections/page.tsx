import { auth } from "@/auth";
import { db } from "@/lib/db";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { CollectionCard } from "@/components/collections/CollectionCard";
import { getAllCollections, getSidebarCollections } from "@/lib/db/collections";
import { getItemTypesWithCounts } from "@/lib/db/items";

async function getDemoUserId(): Promise<string | null> {
  const user = await db.user.findUnique({
    where: { email: "demo@devstash.io" },
    select: { id: true },
  });
  return user?.id ?? null;
}

export default async function CollectionsPage() {
  const session = await auth();
  const userId = session?.user?.id ?? (await getDemoUserId());

  const [collections, sidebarItemTypes, sidebarCollections] = await Promise.all([
    userId ? getAllCollections(userId) : Promise.resolve([]),
    userId ? getItemTypesWithCounts(userId) : Promise.resolve([]),
    userId ? getSidebarCollections(userId) : Promise.resolve([]),
  ]);

  const user = {
    name: session?.user?.name ?? "Demo User",
    email: session?.user?.email ?? "demo@devstash.io",
    image: session?.user?.image ?? null,
  };

  return (
    <DashboardShell itemTypes={sidebarItemTypes} collections={sidebarCollections} user={user} isPro={session?.user?.isPro ?? false}>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Collections</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{collections.length} collections</p>
          </div>
        </div>
        {collections.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-12 text-center">
            <p className="text-muted-foreground text-sm">No collections yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {collections.map((col) => (
              <CollectionCard key={col.id} collection={col} />
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
