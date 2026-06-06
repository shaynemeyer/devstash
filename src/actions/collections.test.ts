import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/db/collections", () => ({
  createCollection: vi.fn(),
  getUserCollectionsList: vi.fn(),
  updateCollection: vi.fn(),
  deleteCollection: vi.fn(),
}));

vi.mock("@/lib/subscription", () => ({
  checkCollectionLimit: vi.fn().mockResolvedValue(null),
}));

import { auth } from "@/auth";
import {
  createCollection as dbCreateCollection,
  getUserCollectionsList,
  updateCollection as dbUpdateCollection,
  deleteCollection as dbDeleteCollection,
} from "@/lib/db/collections";
import { checkCollectionLimit } from "@/lib/subscription";
import { createCollection, getUserCollections, updateCollection, deleteCollection } from "./collections";

const mockAuth = vi.mocked(auth);
const mockDbCreate = vi.mocked(dbCreateCollection);
const mockGetList = vi.mocked(getUserCollectionsList);
const mockDbUpdate = vi.mocked(dbUpdateCollection);
const mockDbDelete = vi.mocked(dbDeleteCollection);
const mockCheckCollectionLimit = vi.mocked(checkCollectionLimit);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getUserCollections action", () => {
  it("returns empty array when no session", async () => {
    mockAuth.mockResolvedValue(null as never);
    const result = await getUserCollections();
    expect(result).toEqual([]);
    expect(mockGetList).not.toHaveBeenCalled();
  });

  it("returns empty array when session has no user id", async () => {
    mockAuth.mockResolvedValue({ user: {} } as never);
    const result = await getUserCollections();
    expect(result).toEqual([]);
    expect(mockGetList).not.toHaveBeenCalled();
  });

  it("returns collections for authenticated user", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    const fakeCollections = [{ id: "col-1", name: "React Patterns" }, { id: "col-2", name: "DevOps" }];
    mockGetList.mockResolvedValue(fakeCollections);
    const result = await getUserCollections();
    expect(result).toEqual(fakeCollections);
    expect(mockGetList).toHaveBeenCalledWith("user-1");
  });
});

const validInput = { name: "My Collection" };

describe("createCollection action", () => {
  it("returns unauthorized when no session", async () => {
    mockAuth.mockResolvedValue(null as never);
    const result = await createCollection(validInput);
    expect(result).toEqual({ success: false, error: "Unauthorized" });
    expect(mockDbCreate).not.toHaveBeenCalled();
  });

  it("returns error when free-tier collection limit is reached", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockCheckCollectionLimit.mockResolvedValueOnce("Free plan is limited to 3 collections. Upgrade to Pro for unlimited collections.");
    const result = await createCollection(validInput);
    expect(result).toEqual({ success: false, error: "Free plan is limited to 3 collections. Upgrade to Pro for unlimited collections." });
    expect(mockDbCreate).not.toHaveBeenCalled();
  });

  it("returns unauthorized when session has no user id", async () => {
    mockAuth.mockResolvedValue({ user: {} } as never);
    const result = await createCollection(validInput);
    expect(result).toEqual({ success: false, error: "Unauthorized" });
    expect(mockDbCreate).not.toHaveBeenCalled();
  });

  it("returns validation error for empty name", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    const result = await createCollection({ name: "" });
    expect(result).toEqual({ success: false, error: "Name is required" });
    expect(mockDbCreate).not.toHaveBeenCalled();
  });

  it("returns validation error for missing name", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    const result = await createCollection({});
    expect(result.success).toBe(false);
    expect(mockDbCreate).not.toHaveBeenCalled();
  });

  it("returns error when db create fails", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockDbCreate.mockResolvedValue(null);
    const result = await createCollection(validInput);
    expect(result).toEqual({ success: false, error: "Failed to create collection" });
    expect(mockDbCreate).toHaveBeenCalledWith(
      expect.objectContaining({ name: "My Collection", userId: "user-1" })
    );
  });

  it("returns created collection on success", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    const fakeCollection = { id: "col-1", name: "My Collection", description: null };
    mockDbCreate.mockResolvedValue(fakeCollection);
    const result = await createCollection(validInput);
    expect(result).toEqual({ success: true, data: fakeCollection });
  });

  it("passes description to db when provided", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    const fakeCollection = { id: "col-1", name: "My Collection", description: "Some desc" };
    mockDbCreate.mockResolvedValue(fakeCollection);
    await createCollection({ name: "My Collection", description: "Some desc" });
    expect(mockDbCreate).toHaveBeenCalledWith(
      expect.objectContaining({ description: "Some desc" })
    );
  });

  it("trims whitespace from name", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    const fakeCollection = { id: "col-1", name: "Trimmed", description: null };
    mockDbCreate.mockResolvedValue(fakeCollection);
    await createCollection({ name: "  Trimmed  " });
    expect(mockDbCreate).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Trimmed" })
    );
  });
});

describe("updateCollection action", () => {
  it("returns unauthorized when no session", async () => {
    mockAuth.mockResolvedValue(null as never);
    const result = await updateCollection("col-1", { name: "New Name" });
    expect(result).toEqual({ success: false, error: "Unauthorized" });
    expect(mockDbUpdate).not.toHaveBeenCalled();
  });

  it("returns validation error for empty name", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    const result = await updateCollection("col-1", { name: "" });
    expect(result).toEqual({ success: false, error: "Name is required" });
    expect(mockDbUpdate).not.toHaveBeenCalled();
  });

  it("returns validation error when name exceeds 100 chars", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    const result = await updateCollection("col-1", { name: "a".repeat(101) });
    expect(result.success).toBe(false);
    expect(mockDbUpdate).not.toHaveBeenCalled();
  });

  it("returns error when db update fails", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockDbUpdate.mockResolvedValue(null);
    const result = await updateCollection("col-1", { name: "New Name" });
    expect(result).toEqual({ success: false, error: "Failed to update collection" });
    expect(mockDbUpdate).toHaveBeenCalledWith("col-1", "user-1", expect.objectContaining({ name: "New Name" }));
  });

  it("returns updated collection on success", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    const updated = { id: "col-1", name: "New Name", description: null };
    mockDbUpdate.mockResolvedValue(updated);
    const result = await updateCollection("col-1", { name: "New Name" });
    expect(result).toEqual({ success: true, data: updated });
  });
});

describe("deleteCollection action", () => {
  it("returns unauthorized when no session", async () => {
    mockAuth.mockResolvedValue(null as never);
    const result = await deleteCollection("col-1");
    expect(result).toEqual({ success: false, error: "Unauthorized" });
    expect(mockDbDelete).not.toHaveBeenCalled();
  });

  it("returns error when db delete fails", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockDbDelete.mockResolvedValue(false);
    const result = await deleteCollection("col-1");
    expect(result).toEqual({ success: false, error: "Failed to delete collection" });
    expect(mockDbDelete).toHaveBeenCalledWith("col-1", "user-1");
  });

  it("returns success when collection is deleted", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockDbDelete.mockResolvedValue(true);
    const result = await deleteCollection("col-1");
    expect(result).toEqual({ success: true });
    expect(mockDbDelete).toHaveBeenCalledWith("col-1", "user-1");
  });
});
