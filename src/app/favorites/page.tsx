import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { FavoritesList } from "@/components/favorites/FavoritesList";
import { getFavoriteItems, getFavoriteCollections } from "@/lib/db/favorites";
import { getItemTypesWithCounts } from "@/lib/db/items-queries";
import { getSidebarCollections } from "@/lib/db/collections";

export default async function FavoritesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const userId = session.user.id;

  const [favoriteItems, favoriteCollections, sidebarItemTypes, sidebarCollections] =
    await Promise.all([
      getFavoriteItems(userId),
      getFavoriteCollections(userId),
      getItemTypesWithCounts(userId),
      getSidebarCollections(userId),
    ]);

  const user = {
    name: session.user.name,
    email: session.user.email,
    image: session.user.image ?? null,
  };

  const totalFavorites = favoriteItems.length + favoriteCollections.length;

  return (
    <DashboardShell itemTypes={sidebarItemTypes} collections={sidebarCollections} user={user} isPro={session.user.isPro}>
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Favorites</h1>
          <p className="text-sm text-muted-foreground mt-0.5 font-mono">
            {totalFavorites} favorited {totalFavorites === 1 ? "item" : "items"}
          </p>
        </div>

        {totalFavorites === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-12 text-center">
            <p className="text-muted-foreground text-sm font-mono">No favorites yet.</p>
            <p className="text-muted-foreground text-xs mt-1 font-mono">
              Star items and collections to see them here.
            </p>
          </div>
        ) : (
          <FavoritesList items={favoriteItems} collections={favoriteCollections} isPro={session.user.isPro} />
        )}
      </div>
    </DashboardShell>
  );
}
