import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ItemsGrid } from "@/components/items/ItemsGrid";
import { ImageGallery } from "@/components/items/ImageGallery";
import { FileList } from "@/components/items/FileList";
import { TypePageActions } from "@/components/items/TypePageActions";
import { ProUpgradeGate } from "@/components/items/ProUpgradeGate";
import { PaginationControls } from "@/components/ui/PaginationControls";
import { getItemsByTypeSlug, getItemTypesWithCounts } from "@/lib/db/items";
import type { ItemWithMeta } from "@/lib/db/items";
import { getSidebarCollections } from "@/lib/db/collections";
import { ITEMS_PER_PAGE } from "@/lib/constants";

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

const SLUG_TYPE_NAMES: Record<string, string> = {
  snippets: "Snippet",
  prompts: "Prompt",
  commands: "Command",
  notes: "Note",
  files: "File",
  images: "Image",
  links: "Link",
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
  searchParams: Promise<{ page?: string }>;
}

export default async function ItemsTypePage({ params, searchParams }: Props) {
  const { type } = await params;
  const { page: pageParam } = await searchParams;

  if (!VALID_SLUGS.includes(type)) notFound();

  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  const session = await auth();
  const isPro = session?.user?.isPro ?? false;
  const userId = session?.user?.id ?? (await getDemoUserId());

  const PRO_ONLY_SLUGS = ["files", "images"];
  if (PRO_ONLY_SLUGS.includes(type) && !isPro) {
    const [sidebarItemTypes, sidebarCollections] = await Promise.all([
      userId ? getItemTypesWithCounts(userId) : Promise.resolve([]),
      userId ? getSidebarCollections(userId) : Promise.resolve([]),
    ]);
    const user = {
      name: session?.user?.name ?? "Demo User",
      email: session?.user?.email ?? "demo@devstash.io",
      image: session?.user?.image ?? null,
    };
    return (
      <DashboardShell itemTypes={sidebarItemTypes} collections={sidebarCollections} user={user} isPro={isPro}>
        <div className="p-6 max-w-6xl mx-auto">
          <ProUpgradeGate feature={SLUG_LABELS[type]} />
        </div>
      </DashboardShell>
    );
  }

  const [{ items, total }, sidebarItemTypes, sidebarCollections] = await Promise.all([
    userId ? getItemsByTypeSlug(userId, type, page) : Promise.resolve({ items: [] as ItemWithMeta[], total: 0 }),
    userId ? getItemTypesWithCounts(userId) : Promise.resolve([]),
    userId ? getSidebarCollections(userId) : Promise.resolve([]),
  ]);

  const user = {
    name: session?.user?.name ?? "Demo User",
    email: session?.user?.email ?? "demo@devstash.io",
    image: session?.user?.image ?? null,
  };

  const label = SLUG_LABELS[type];
  const typeName = SLUG_TYPE_NAMES[type];
  const defaultTypeId = sidebarItemTypes.find((t) => t.name.toLowerCase() === typeName.toLowerCase())?.id ?? "";
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  return (
    <DashboardShell itemTypes={sidebarItemTypes} collections={sidebarCollections} user={user} isPro={isPro}>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <TypePageActions
          label={label}
          count={total}
          itemTypes={sidebarItemTypes}
          defaultTypeId={defaultTypeId}
        />
        {type === "images" ? (
          <ImageGallery items={items} isPro={isPro} />
        ) : type === "files" ? (
          <FileList items={items} isPro={isPro} />
        ) : (
          <ItemsGrid items={items} emptyLabel={label.toLowerCase()} isPro={isPro} />
        )}
        <PaginationControls
          page={page}
          totalPages={totalPages}
          buildHref={(p) => `/items/${type}?page=${p}`}
        />
      </div>
    </DashboardShell>
  );
}
