import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ItemsGrid } from "@/components/items/ItemsGrid";
import { CollectionActions } from "@/components/collections/CollectionActions";
import { PaginationControls } from "@/components/pagination/PaginationControls";
import { getCollectionDetail, getSidebarCollections } from "@/lib/db/collections";
import { getItemsByCollectionId, getItemTypesWithCounts } from "@/lib/db/items";
import type { ItemWithMeta } from "@/lib/db/items";
import { COLLECTIONS_PER_PAGE } from "@/lib/constants";

async function getDemoUserId(): Promise<string | null> {
  const user = await db.user.findUnique({
    where: { email: "demo@devstash.io" },
    select: { id: true },
  });
  return user?.id ?? null;
}

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}

export default async function CollectionDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { page: pageParam } = await searchParams;

  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  const session = await auth();
  const userId = session?.user?.id ?? (await getDemoUserId());

  const emptyItems: { items: ItemWithMeta[]; total: number } = { items: [], total: 0 };

  const [collection, { items, total }, sidebarItemTypes, sidebarCollections] = await Promise.all([
    userId ? getCollectionDetail(userId, id) : Promise.resolve(null),
    userId ? getItemsByCollectionId(userId, id, page) : Promise.resolve(emptyItems),
    userId ? getItemTypesWithCounts(userId) : Promise.resolve([]),
    userId ? getSidebarCollections(userId) : Promise.resolve([]),
  ]);

  if (!collection) notFound();

  const user = {
    name: session?.user?.name ?? "Demo User",
    email: session?.user?.email ?? "demo@devstash.io",
    image: session?.user?.image ?? null,
  };

  const totalPages = Math.ceil(total / COLLECTIONS_PER_PAGE);

  return (
    <DashboardShell itemTypes={sidebarItemTypes} collections={sidebarCollections} user={user} isPro={session?.user?.isPro ?? false}>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-foreground">{collection.name}</h1>
            {collection.description && (
              <p className="text-sm text-muted-foreground mt-1">{collection.description}</p>
            )}
            <p className="text-sm text-muted-foreground mt-0.5">{total} {total === 1 ? "item" : "items"}</p>
          </div>
          <CollectionActions collection={collection} />
        </div>
        <ItemsGrid items={items} emptyLabel="items in this collection" isPro={session?.user?.isPro ?? false} />
        <PaginationControls
          page={page}
          totalPages={totalPages}
          buildHref={(p) => `/collections/${id}?page=${p}`}
        />
      </div>
    </DashboardShell>
  );
}
