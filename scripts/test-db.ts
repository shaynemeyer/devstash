import "dotenv/config";
import { PrismaClient } from "../prisma/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter });

async function main() {
  console.log("Testing database connection...");

  const itemTypes = await db.itemType.findMany({
    orderBy: { name: "asc" },
  });

  console.log(`Connected. Found ${itemTypes.length} system item types:`);
  for (const t of itemTypes) {
    console.log(`  ${t.name} — icon: ${t.icon}, color: ${t.color}`);
  }

  const userCount = await db.user.count();
  const itemCount = await db.item.count();
  const collectionCount = await db.collection.count();

  console.log(`Users: ${userCount}`);
  console.log(`Items: ${itemCount}`);
  console.log(`Collections: ${collectionCount}`);
}

main()
  .catch((e) => {
    console.error("Database connection failed:", e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
