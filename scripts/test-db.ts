import "dotenv/config";
import { PrismaClient } from "../prisma/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter });

async function main() {
  console.log("Testing database connection...\n");

  // Item types
  const itemTypes = await db.itemType.findMany({ orderBy: { name: "asc" } });
  console.log(`Item types (${itemTypes.length}):`);
  for (const t of itemTypes) {
    console.log(`  [${t.isSystem ? "system" : "custom"}] ${t.name} — icon: ${t.icon}, color: ${t.color}`);
  }

  // Demo user
  console.log("\nDemo user:");
  const user = await db.user.findUnique({
    where: { email: "demo@devstash.io" },
    select: { id: true, name: true, email: true, emailVerified: true, isPro: true },
  });
  if (user) {
    console.log(`  ${user.name} <${user.email}> | isPro: ${user.isPro} | verified: ${user.emailVerified?.toISOString() ?? "no"}`);
  } else {
    console.log("  not found");
  }

  // Collections with item counts
  console.log("\nCollections:");
  const collections = await db.collection.findMany({
    include: { items: { include: { item: { include: { type: true } } } } },
    orderBy: { name: "asc" },
  });
  for (const col of collections) {
    console.log(`  ${col.name} (${col.items.length} items) — ${col.description}`);
    for (const { item } of col.items) {
      const tags = await db.tagsOnItems.findMany({
        where: { itemId: item.id },
        include: { tag: true },
      });
      const tagList = tags.map((t) => t.tag.name).join(", ");
      console.log(`    • [${item.type.name}] ${item.title}${tagList ? ` [${tagList}]` : ""}`);
    }
  }

  // Totals
  const [userCount, itemCount, collectionCount, tagCount] = await Promise.all([
    db.user.count(),
    db.item.count(),
    db.collection.count(),
    db.tag.count(),
  ]);
  console.log(`\nTotals — users: ${userCount}, items: ${itemCount}, collections: ${collectionCount}, tags: ${tagCount}`);
}

main()
  .catch((e) => {
    console.error("Database connection failed:", e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
