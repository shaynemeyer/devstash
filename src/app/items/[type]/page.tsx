import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ItemsGrid } from "@/components/items/ItemsGrid";
import { ImageGallery } from "@/components/items/ImageGallery";
import { FileList } from "@/components/items/FileList";
import { TypePageActions } from "@/components/items/TypePageActions";
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
  const typeName = SLUG_TYPE_NAMES[type];
  const defaultTypeId = sidebarItemTypes.find((t) => t.name === typeName)?.id ?? "";

  return (
    <DashboardShell itemTypes={sidebarItemTypes} collections={sidebarCollections} user={user}>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <TypePageActions
          label={label}
          count={items.length}
          itemTypes={sidebarItemTypes}
          defaultTypeId={defaultTypeId}
        />
        {type === "images" ? (
          <ImageGallery items={items} />
        ) : type === "files" ? (
          <FileList items={items} />
        ) : (
          <ItemsGrid items={items} emptyLabel={label.toLowerCase()} />
        )}
      </div>
    </DashboardShell>
  );
}
