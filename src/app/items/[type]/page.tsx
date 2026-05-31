import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ItemsGrid } from "@/components/items/ItemsGrid";
import { getItemsByTypeSlug, getItemTypesWithCounts } from "@/lib/db/items";
import { getSidebarCollections } from "@/lib/db/collections";

const VALID_SLUGS = ["snippets", "prompts", "commands", "notes", "files", "images", "links"];

const SLUG_LABELS: Record<string, string> = {
  snippets: "Snippets",
  prompts: "Prompts",
  commands: "Commands",
  notes: "Notes",
  files: "Files",
  images: "Images",
  links: "Links",
};

async function getDemoUserId(): Promise<string | null> {
  const user = await db.user.findUnique({
    where: { email: "demo@devstash.io" },
    select: { id: true },
  });
  return user?.id ?? null;
}

interface Props {
  params: Promise<{ type: string }>;
}

export default async function ItemsTypePage({ params }: Props) {
  const { type } = await params;

  if (!VALID_SLUGS.includes(type)) notFound();

  const session = await auth();
  const userId = session?.user?.id ?? (await getDemoUserId());

  const [items, sidebarItemTypes, sidebarCollections] = await Promise.all([
    userId ? getItemsByTypeSlug(userId, type) : Promise.resolve([]),
    userId ? getItemTypesWithCounts(userId) : Promise.resolve([]),
    userId ? getSidebarCollections(userId) : Promise.resolve([]),
  ]);

  const user = {
    name: session?.user?.name ?? "Demo User",
    email: session?.user?.email ?? "demo@devstash.io",
    image: session?.user?.image ?? null,
  };

  const label = SLUG_LABELS[type];

  return (
    <DashboardShell itemTypes={sidebarItemTypes} collections={sidebarCollections} user={user}>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{label}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {items.length} {items.length === 1 ? "item" : "items"}
          </p>
        </div>
        <ItemsGrid items={items} emptyLabel={label.toLowerCase()} />
      </div>
    </DashboardShell>
  );
}
