import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "./generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const adapter = new PrismaNeon({ connectionString: process.env.DIRECT_URL });
const db = new PrismaClient({ adapter });

// ─── Item Types ───────────────────────────────────────────────────────────────

const SYSTEM_ITEM_TYPES = [
  { id: "system-snippet", name: "snippet", icon: "Code", color: "#3b82f6" },
  { id: "system-prompt", name: "prompt", icon: "Sparkles", color: "#8b5cf6" },
  { id: "system-command", name: "command", icon: "Terminal", color: "#f97316" },
  { id: "system-note", name: "note", icon: "StickyNote", color: "#fde047" },
  { id: "system-file", name: "file", icon: "File", color: "#6b7280" },
  { id: "system-image", name: "image", icon: "Image", color: "#ec4899" },
  { id: "system-link", name: "link", icon: "Link", color: "#10b981" },
] as const;

// ─── Seed data ────────────────────────────────────────────────────────────────

const COLLECTIONS = [
  {
    name: "React Patterns",
    description: "Reusable React patterns and hooks",
    items: [
      {
        title: "useDebounce & useLocalStorage hooks",
        typeId: "system-snippet",
        contentType: "text" as const,
        language: "typescript",
        description: "Custom hooks for debouncing values and syncing state with localStorage",
        content: `import { useEffect, useState } from "react";

export function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return initial;
    try {
      const stored = localStorage.getItem(key);
      return stored ? (JSON.parse(stored) as T) : initial;
    } catch {
      return initial;
    }
  });

  const set = (next: T) => {
    setValue(next);
    localStorage.setItem(key, JSON.stringify(next));
  };

  return [value, set] as const;
}`,
        tags: ["react", "hooks", "typescript"],
        isFavorite: true,
        isPinned: true,
      },
      {
        title: "Context provider + compound component pattern",
        typeId: "system-snippet",
        contentType: "text" as const,
        language: "typescript",
        description: "Compound component pattern using React context",
        content: `import { createContext, useContext, useState } from "react";

interface AccordionCtx {
  open: string | null;
  toggle: (id: string) => void;
}

const AccordionContext = createContext<AccordionCtx | null>(null);

function useAccordion() {
  const ctx = useContext(AccordionContext);
  if (!ctx) throw new Error("Must be used inside <Accordion>");
  return ctx;
}

export function Accordion({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState<string | null>(null);
  const toggle = (id: string) => setOpen((prev) => (prev === id ? null : id));
  return (
    <AccordionContext.Provider value={{ open, toggle }}>
      <div>{children}</div>
    </AccordionContext.Provider>
  );
}

Accordion.Item = function Item({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  const { open, toggle } = useAccordion();
  return (
    <div>
      <button onClick={() => toggle(id)}>{title}</button>
      {open === id && <div>{children}</div>}
    </div>
  );
};`,
        tags: ["react", "context", "compound-components"],
        isFavorite: false,
        isPinned: false,
      },
      {
        title: "Utility functions (cn, formatDate, truncate)",
        typeId: "system-snippet",
        contentType: "text" as const,
        language: "typescript",
        description: "Common utility helpers used across React projects",
        content: `import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string, locale = "en-US"): string {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

export function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max - 1) + "…" : str;
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}`,
        tags: ["typescript", "utils", "helpers"],
        isFavorite: false,
        isPinned: false,
      },
    ],
  },
  {
    name: "AI Workflows",
    description: "AI prompts and workflow automations",
    items: [
      {
        title: "Code review prompt",
        typeId: "system-prompt",
        contentType: "text" as const,
        language: null,
        description: "Structured prompt for thorough AI-assisted code reviews",
        content: `You are an expert software engineer. Review the following code and provide feedback on:

1. **Correctness** – Are there any bugs or logic errors?
2. **Security** – Any vulnerabilities (injections, auth issues, data exposure)?
3. **Performance** – Unnecessary re-renders, N+1 queries, blocking operations?
4. **Readability** – Is the code clear and self-documenting?
5. **Best practices** – Does it follow conventions for this language/framework?

For each issue, include:
- Severity: [critical | major | minor | suggestion]
- Location: file and line (if provided)
- Explanation of the problem
- A concrete fix or recommendation

Code to review:
\`\`\`
{{CODE}}
\`\`\``,
        tags: ["ai", "code-review", "prompt"],
        isFavorite: true,
        isPinned: false,
      },
      {
        title: "Documentation generation prompt",
        typeId: "system-prompt",
        contentType: "text" as const,
        language: null,
        description: "Generate clear JSDoc/TSDoc or README documentation from code",
        content: `You are a technical writer and senior developer. Generate comprehensive documentation for the following code.

Include:
- A concise summary of what the module/function does
- Parameters with types and descriptions
- Return value with type and description
- Usage example (runnable)
- Any important caveats or side effects

Output format: JSDoc comments placed directly above each function/class, followed by a brief Markdown summary.

Code:
\`\`\`
{{CODE}}
\`\`\``,
        tags: ["ai", "documentation", "prompt"],
        isFavorite: false,
        isPinned: false,
      },
      {
        title: "Refactoring assistance prompt",
        typeId: "system-prompt",
        contentType: "text" as const,
        language: null,
        description: "Prompt for AI-guided code refactoring with explanation",
        content: `You are a senior software engineer specialising in clean code and refactoring.

Refactor the code below to improve readability, maintainability, and performance without changing its external behaviour.

Guidelines:
- Extract repeated logic into named helpers
- Replace magic numbers/strings with named constants
- Simplify conditionals where possible
- Prefer composition over inheritance
- Add brief comments only where intent is non-obvious

Provide:
1. The refactored code in full
2. A bullet list of every change made and why

Original code:
\`\`\`
{{CODE}}
\`\`\``,
        tags: ["ai", "refactoring", "prompt"],
        isFavorite: false,
        isPinned: false,
      },
    ],
  },
  {
    name: "DevOps",
    description: "Infrastructure and deployment resources",
    items: [
      {
        title: "Docker multi-stage build for Node.js",
        typeId: "system-snippet",
        contentType: "text" as const,
        language: "dockerfile",
        description: "Production-optimised multi-stage Dockerfile for a Next.js app",
        content: `FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --frozen-lockfile

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]`,
        tags: ["docker", "devops", "nodejs"],
        isFavorite: false,
        isPinned: false,
      },
      {
        title: "Deploy to production",
        typeId: "system-command",
        contentType: "text" as const,
        language: "bash",
        description: "Run database migrations then restart the app via PM2",
        content: `npx prisma migrate deploy && pm2 restart devstash --update-env`,
        tags: ["deploy", "prisma", "pm2"],
        isFavorite: false,
        isPinned: false,
      },
      {
        title: "GitHub Actions documentation",
        typeId: "system-link",
        contentType: "url" as const,
        language: null,
        description: "Official GitHub Actions docs – workflows, triggers, and marketplace",
        content: null,
        url: "https://docs.github.com/en/actions",
        tags: ["github", "ci-cd", "devops"],
        isFavorite: false,
        isPinned: false,
      },
      {
        title: "Docker Compose reference",
        typeId: "system-link",
        contentType: "url" as const,
        language: null,
        description: "Full Docker Compose file format reference",
        content: null,
        url: "https://docs.docker.com/compose/compose-file/",
        tags: ["docker", "devops"],
        isFavorite: false,
        isPinned: false,
      },
    ],
  },
] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function upsertTags(tagNames: readonly string[]): Promise<string[]> {
  const ids: string[] = [];
  for (const name of tagNames) {
    const tag = await db.tag.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    ids.push(tag.id);
  }
  return ids;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  // 1. System item types
  console.log("Seeding system item types...");
  for (const t of SYSTEM_ITEM_TYPES) {
    await db.itemType.upsert({
      where: { id: t.id },
      update: { icon: t.icon, color: t.color },
      create: { id: t.id, name: t.name, icon: t.icon, color: t.color, isSystem: true },
    });
    console.log(`  - ${t.name}`);
  }

  // 2. Demo user
  console.log("Seeding demo user...");
  const passwordHash = await bcrypt.hash("12345678", 12);
  const user = await db.user.upsert({
    where: { email: "demo@devstash.io" },
    update: { password: passwordHash },
    create: {
      email: "demo@devstash.io",
      name: "Demo User",
      emailVerified: new Date(),
      isPro: false,
      password: passwordHash,
    },
  });
  console.log(`  - ${user.email}`);

  // 3. Collections + items
  console.log("Seeding collections and items...");
  for (const col of COLLECTIONS) {
    const collection = await db.collection.upsert({
      where: {
        // Synthetic stable key: user + name
        id: `seed-${user.id}-${col.name.toLowerCase().replace(/\s+/g, "-")}`,
      },
      update: {},
      create: {
        id: `seed-${user.id}-${col.name.toLowerCase().replace(/\s+/g, "-")}`,
        name: col.name,
        description: col.description,
        userId: user.id,
      },
    });
    console.log(`  [${col.name}]`);

    for (const itemDef of col.items) {
      const item = await db.item.upsert({
        where: {
          id: `seed-${user.id}-${itemDef.title.toLowerCase().replace(/\s+/g, "-").slice(0, 48)}`,
        },
        update: {},
        create: {
          id: `seed-${user.id}-${itemDef.title.toLowerCase().replace(/\s+/g, "-").slice(0, 48)}`,
          title: itemDef.title,
          contentType: itemDef.contentType,
          content: itemDef.content ?? null,
          url: "url" in itemDef ? itemDef.url : null,
          description: itemDef.description,
          language: itemDef.language ?? null,
          isFavorite: itemDef.isFavorite,
          isPinned: itemDef.isPinned,
          userId: user.id,
          typeId: itemDef.typeId,
        },
      });
      console.log(`    - ${item.title}`);

      // Tags
      const tagIds = await upsertTags(itemDef.tags);
      for (const tagId of tagIds) {
        await db.tagsOnItems.upsert({
          where: { itemId_tagId: { itemId: item.id, tagId } },
          update: {},
          create: { itemId: item.id, tagId },
        });
      }

      // Link item → collection
      await db.itemCollection.upsert({
        where: { itemId_collectionId: { itemId: item.id, collectionId: collection.id } },
        update: {},
        create: { itemId: item.id, collectionId: collection.id },
      });
    }
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
