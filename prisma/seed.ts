import "dotenv/config";
import { PrismaClient } from "./generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const adapter = new PrismaNeon({ connectionString: process.env.DIRECT_URL });
const db = new PrismaClient({ adapter });

const SYSTEM_ITEM_TYPES = [
  { name: "Snippet", icon: "Code", color: "#3b82f6" },
  { name: "Prompt", icon: "Sparkles", color: "#8b5cf6" },
  { name: "Command", icon: "Terminal", color: "#f97316" },
  { name: "Note", icon: "StickyNote", color: "#fde047" },
  { name: "File", icon: "File", color: "#6b7280" },
  { name: "Image", icon: "Image", color: "#ec4899" },
  { name: "Link", icon: "Link", color: "#10b981" },
];

async function main() {
  console.log("Seeding system item types...");

  for (const itemType of SYSTEM_ITEM_TYPES) {
    await db.itemType.upsert({
      where: { id: `system-${itemType.name.toLowerCase()}` },
      update: { icon: itemType.icon, color: itemType.color },
      create: {
        id: `system-${itemType.name.toLowerCase()}`,
        name: itemType.name,
        icon: itemType.icon,
        color: itemType.color,
        isSystem: true,
      },
    });
    console.log(`  - ${itemType.name}`);
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
