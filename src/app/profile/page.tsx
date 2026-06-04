import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getProfileUser, getProfileStats, type ProfileStats } from "@/lib/db/profile";
import { getItemTypesWithCounts } from "@/lib/db/items";
import { getSidebarCollections } from "@/lib/db/collections";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { getIcon } from "@/lib/icons";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const userId = session.user.id;

  const [profileUser, stats, sidebarItemTypes, sidebarCollections] = await Promise.all([
    getProfileUser(userId),
    getProfileStats(userId),
    getItemTypesWithCounts(userId),
    getSidebarCollections(userId),
  ]);

  if (!profileUser) redirect("/sign-in");

  const shellUser = {
    name: session.user?.name ?? profileUser.name,
    email: session.user?.email ?? profileUser.email,
    image: session.user?.image ?? null,
  };

  const joined = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(profileUser.createdAt);

  return (
    <DashboardShell itemTypes={sidebarItemTypes} collections={sidebarCollections} user={shellUser}>
      <div className="p-6 max-w-3xl mx-auto space-y-10">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Profile</h1>
          <p className="text-muted-foreground text-sm mt-1">Your account info and usage stats</p>
        </div>

        {/* User info */}
        <section className="space-y-4">
          <h2 className="text-base font-semibold text-foreground border-b border-border pb-2">
            Account info
          </h2>
          <div className="flex items-center gap-4">
            <UserAvatar name={profileUser.name} image={profileUser.image} size={56} />
            <div>
              <p className="font-medium text-foreground">{profileUser.name ?? "—"}</p>
              <p className="text-sm text-muted-foreground">{profileUser.email}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Member since {joined}</p>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="space-y-4">
          <h2 className="text-base font-semibold text-foreground border-b border-border pb-2">
            Usage stats
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-lg border border-border bg-card p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{stats.totalItems}</p>
              <p className="text-xs text-muted-foreground mt-1">Total items</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{stats.totalCollections}</p>
              <p className="text-xs text-muted-foreground mt-1">Collections</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {stats.itemTypeCounts.map((t: ProfileStats["itemTypeCounts"][number]) => {
              const Icon = getIcon(t.icon);
              return (
                <div
                  key={t.name}
                  className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
                >
                  <Icon size={16} style={{ color: t.color }} className="shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{t.count}</p>
                    <p className="text-xs text-muted-foreground">{t.name}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

      </div>
    </DashboardShell>
  );
}
