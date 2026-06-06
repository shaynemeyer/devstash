import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
  db: {
    user: { findUnique: vi.fn() },
    item: { count: vi.fn() },
    collection: { count: vi.fn() },
  },
}));

import { db } from "@/lib/db";
import { checkItemLimit, checkCollectionLimit } from "./subscription";

const mockUserFind = vi.mocked(db.user.findUnique);
const mockItemCount = vi.mocked(db.item.count);
const mockCollectionCount = vi.mocked(db.collection.count);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("checkItemLimit", () => {
  it("returns null for Pro user regardless of item count", async () => {
    mockUserFind.mockResolvedValue({ isPro: true } as never);
    const result = await checkItemLimit("user-1");
    expect(result).toBeNull();
    expect(mockItemCount).not.toHaveBeenCalled();
  });

  it("returns null for free user with 49 items", async () => {
    mockUserFind.mockResolvedValue({ isPro: false } as never);
    mockItemCount.mockResolvedValue(49);
    const result = await checkItemLimit("user-1");
    expect(result).toBeNull();
  });

  it("returns error string for free user with exactly 50 items (at limit)", async () => {
    mockUserFind.mockResolvedValue({ isPro: false } as never);
    mockItemCount.mockResolvedValue(50);
    const result = await checkItemLimit("user-1");
    expect(result).toBeTypeOf("string");
    expect(result).toContain("50");
  });

  it("returns error string for free user with 51 items (over limit)", async () => {
    mockUserFind.mockResolvedValue({ isPro: false } as never);
    mockItemCount.mockResolvedValue(51);
    const result = await checkItemLimit("user-1");
    expect(result).toBeTypeOf("string");
    expect(result).toContain("50");
  });
});

describe("checkCollectionLimit", () => {
  it("returns null for Pro user regardless of collection count", async () => {
    mockUserFind.mockResolvedValue({ isPro: true } as never);
    const result = await checkCollectionLimit("user-1");
    expect(result).toBeNull();
    expect(mockCollectionCount).not.toHaveBeenCalled();
  });

  it("returns null for free user with 2 collections", async () => {
    mockUserFind.mockResolvedValue({ isPro: false } as never);
    mockCollectionCount.mockResolvedValue(2);
    const result = await checkCollectionLimit("user-1");
    expect(result).toBeNull();
  });

  it("returns error string for free user with exactly 3 collections (at limit)", async () => {
    mockUserFind.mockResolvedValue({ isPro: false } as never);
    mockCollectionCount.mockResolvedValue(3);
    const result = await checkCollectionLimit("user-1");
    expect(result).toBeTypeOf("string");
    expect(result).toContain("3");
  });

  it("returns error string for free user with 4 collections (over limit)", async () => {
    mockUserFind.mockResolvedValue({ isPro: false } as never);
    mockCollectionCount.mockResolvedValue(4);
    const result = await checkCollectionLimit("user-1");
    expect(result).toBeTypeOf("string");
    expect(result).toContain("3");
  });
});
