import "dotenv/config";
import { PrismaClient } from "../prisma/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const DEMO_EMAIL = "demo@devstash.io";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter });

const dryRun = process.argv.includes("--dry-run");

async function main() {
  const users = await db.user.findMany({
    where: { email: { not: DEMO_EMAIL } },
    select: { id: true, email: true, name: true },
  });

  if (users.length === 0) {
    console.log("No users to delete (only demo user exists).");
    return;
  }

  console.log(`Users to delete (${users.length}):`);
  for (const u of users) {
    console.log(`  ${u.name ?? "(no name)"} <${u.email}>`);
  }

  if (dryRun) {
    console.log("\n--dry-run: no changes made.");
    return;
  }

  const emails = users.map((u) => u.email).filter(Boolean) as string[];

  // VerificationToken has no FK to User, so delete by identifier (email)
  const { count: tokenCount } = await db.verificationToken.deleteMany({
    where: { identifier: { in: emails } },
  });

  // Deleting users cascades: Items, Collections, ItemTypes, Accounts, Sessions
  // and their children: TagsOnItems, ItemCollections
  const { count: userCount } = await db.user.deleteMany({
    where: { email: { not: DEMO_EMAIL } },
  });

  console.log(`\nDeleted ${userCount} user(s) and ${tokenCount} verification token(s).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
