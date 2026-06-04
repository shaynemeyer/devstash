import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    item: { findMany: vi.fn() },
    collection: { findMany: vi.fn() },
  },
}));

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getSearchData } from "./search";

const mockAuth = vi.mocked(auth);
const mockItemFindMany = vi.mocked(db.item.findMany);
const mockCollectionFindMany = vi.mocked(db.collection.findMany);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getSearchData", () => {
  it("returns empty data when unauthenticated", async () => {
    mockAuth.mockResolvedValue(null as never);
    const result = await getSearchData();
    expect(result).toEqual({ items: [], collections: [] });
    expect(mockItemFindMany).not.toHaveBeenCalled();
    expect(mockCollectionFindMany).not.toHaveBeenCalled();
  });

  it("returns empty data when session has no user id", async () => {
    mockAuth.mockResolvedValue({ user: {} } as never);
    const result = await getSearchData();
    expect(result).toEqual({ items: [], collections: [] });
    expect(mockItemFindMany).not.toHaveBeenCalled();
  });

  it("maps items to SearchItem shape", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockItemFindMany.mockResolvedValue([
      {
        id: "item-1",
        title: "My Snippet",
        type: { name: "Snippet", icon: "Code", color: "#3b82f6" },
      },
    ] as never);
    mockCollectionFindMany.mockResolvedValue([] as never);

    const result = await getSearchData();

    expect(result.items).toEqual([
      { id: "item-1", title: "My Snippet", typeName: "Snippet", typeIcon: "Code", typeColor: "#3b82f6" },
    ]);
  });

  it("maps collections to SearchCollection shape using _count.items", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockItemFindMany.mockResolvedValue([] as never);
    mockCollectionFindMany.mockResolvedValue([
      { id: "col-1", name: "React Patterns", _count: { items: 3 } },
    ] as never);

    const result = await getSearchData();

    expect(result.collections).toEqual([
      { id: "col-1", name: "React Patterns", itemCount: 3 },
    ]);
  });

  it("queries db with the authenticated user's id", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-42" } } as never);
    mockItemFindMany.mockResolvedValue([] as never);
    mockCollectionFindMany.mockResolvedValue([] as never);

    await getSearchData();

    expect(mockItemFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: "user-42" } })
    );
    expect(mockCollectionFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: "user-42" } })
    );
  });
});
