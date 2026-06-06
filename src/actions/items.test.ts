import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/db/items", () => ({
  deleteItem: vi.fn(),
  updateItem: vi.fn(),
  createItem: vi.fn(),
  setItemPinned: vi.fn(),
  setItemFavorite: vi.fn(),
}));

vi.mock("@/lib/r2", () => ({
  r2: { send: vi.fn().mockResolvedValue({}) },
  R2_BUCKET: "test-bucket",
}));

vi.mock("@/lib/subscription", () => ({
  checkItemLimit: vi.fn().mockResolvedValue(null),
}));

import { auth } from "@/auth";
import { r2 } from "@/lib/r2";
import { deleteItem as dbDeleteItem, updateItem as dbUpdateItem, createItem as dbCreateItem, setItemPinned as dbSetItemPinned, setItemFavorite as dbSetItemFavorite } from "@/lib/db/items";
import { checkItemLimit } from "@/lib/subscription";
import { deleteItem, updateItem, createItem, toggleItemPin, toggleFavoriteItem } from "./items";

const mockAuth = vi.mocked(auth);
const mockR2Send = vi.mocked(r2.send);
const mockDbDelete = vi.mocked(dbDeleteItem);
const mockDbUpdate = vi.mocked(dbUpdateItem);
const mockDbCreate = vi.mocked(dbCreateItem);
const mockDbSetPinned = vi.mocked(dbSetItemPinned);
const mockDbSetFavorite = vi.mocked(dbSetItemFavorite);
const mockCheckItemLimit = vi.mocked(checkItemLimit);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("deleteItem action", () => {
  it("returns unauthorized when no session", async () => {
    mockAuth.mockResolvedValue(null as never);
    const result = await deleteItem("item-1");
    expect(result).toEqual({ success: false, error: "Unauthorized" });
    expect(mockDbDelete).not.toHaveBeenCalled();
  });

  it("returns unauthorized when session has no user id", async () => {
    mockAuth.mockResolvedValue({ user: {} } as never);
    const result = await deleteItem("item-1");
    expect(result).toEqual({ success: false, error: "Unauthorized" });
    expect(mockDbDelete).not.toHaveBeenCalled();
  });

  it("returns error when db delete fails", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockDbDelete.mockResolvedValue({ ok: false, fileUrl: null } as never);
    const result = await deleteItem("item-1");
    expect(result).toEqual({ success: false, error: "Failed to delete item" });
    expect(mockDbDelete).toHaveBeenCalledWith("item-1", "user-1");
  });

  it("returns success when item is deleted without a file", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockDbDelete.mockResolvedValue({ ok: true, fileUrl: null } as never);
    const result = await deleteItem("item-1");
    expect(result).toEqual({ success: true });
    expect(mockDbDelete).toHaveBeenCalledWith("item-1", "user-1");
    expect(mockR2Send).not.toHaveBeenCalled();
  });

  it("deletes from R2 when item has a fileUrl", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockDbDelete.mockResolvedValue({ ok: true, fileUrl: "user-1/uuid-file.pdf" } as never);
    const result = await deleteItem("item-1");
    expect(result).toEqual({ success: true });
    expect(mockR2Send).toHaveBeenCalledOnce();
  });

  it("still returns success if R2 delete fails", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockDbDelete.mockResolvedValue({ ok: true, fileUrl: "user-1/uuid-img.png" } as never);
    mockR2Send.mockRejectedValueOnce(new Error("R2 error"));
    const result = await deleteItem("item-1");
    expect(result).toEqual({ success: true });
  });
});

const validInput = { title: "My Item", tags: [] };

describe("updateItem action", () => {
  it("returns unauthorized when no session", async () => {
    mockAuth.mockResolvedValue(null as never);
    const result = await updateItem("item-1", validInput);
    expect(result).toEqual({ success: false, error: "Unauthorized" });
    expect(mockDbUpdate).not.toHaveBeenCalled();
  });

  it("returns validation error for invalid input", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    const result = await updateItem("item-1", { title: "" });
    expect(result.success).toBe(false);
    expect(result.error).toBe("Title is required");
    expect(mockDbUpdate).not.toHaveBeenCalled();
  });

  it("returns error when db update fails", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockDbUpdate.mockResolvedValue(null);
    const result = await updateItem("item-1", validInput);
    expect(result).toEqual({ success: false, error: "Failed to update item" });
    expect(mockDbUpdate).toHaveBeenCalledWith("item-1", "user-1", expect.objectContaining({ title: "My Item" }));
  });

  it("returns updated item on success", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    const fakeItem = { id: "item-1", title: "My Item" };
    mockDbUpdate.mockResolvedValue(fakeItem as never);
    const result = await updateItem("item-1", validInput);
    expect(result).toEqual({ success: true, data: fakeItem });
  });

  it("passes collectionIds to db update when provided", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    const fakeItem = { id: "item-1", title: "My Item" };
    mockDbUpdate.mockResolvedValue(fakeItem as never);
    await updateItem("item-1", { ...validInput, collectionIds: ["col-1", "col-2"] });
    expect(mockDbUpdate).toHaveBeenCalledWith(
      "item-1",
      "user-1",
      expect.objectContaining({ collectionIds: ["col-1", "col-2"] })
    );
  });

  it("passes empty collectionIds when not provided", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    const fakeItem = { id: "item-1", title: "My Item" };
    mockDbUpdate.mockResolvedValue(fakeItem as never);
    await updateItem("item-1", validInput);
    expect(mockDbUpdate).toHaveBeenCalledWith(
      "item-1",
      "user-1",
      expect.objectContaining({ collectionIds: [] })
    );
  });
});

const validCreateInput = {
  typeId: "type-1",
  typeName: "Snippet",
  title: "New Snippet",
  tags: [],
};

describe("createItem action", () => {
  it("returns unauthorized when no session", async () => {
    mockAuth.mockResolvedValue(null as never);
    const result = await createItem(validCreateInput);
    expect(result).toEqual({ success: false, error: "Unauthorized" });
    expect(mockDbCreate).not.toHaveBeenCalled();
  });

  it("returns error when free-tier item limit is reached", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockCheckItemLimit.mockResolvedValueOnce("Free plan is limited to 50 items. Upgrade to Pro for unlimited items.");
    const result = await createItem(validCreateInput);
    expect(result).toEqual({ success: false, error: "Free plan is limited to 50 items. Upgrade to Pro for unlimited items." });
    expect(mockDbCreate).not.toHaveBeenCalled();
  });

  it("returns unauthorized when session has no user id", async () => {
    mockAuth.mockResolvedValue({ user: {} } as never);
    const result = await createItem(validCreateInput);
    expect(result).toEqual({ success: false, error: "Unauthorized" });
    expect(mockDbCreate).not.toHaveBeenCalled();
  });

  it("returns validation error for empty title", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    const result = await createItem({ ...validCreateInput, title: "" });
    expect(result).toEqual({ success: false, error: "Title is required" });
    expect(mockDbCreate).not.toHaveBeenCalled();
  });

  it("returns validation error for Link with no URL", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    const result = await createItem({ ...validCreateInput, typeName: "Link", url: null });
    expect(result.success).toBe(false);
    expect(result.error).toBe("URL is required for links");
    expect(mockDbCreate).not.toHaveBeenCalled();
  });

  it("returns error when db create fails", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockDbCreate.mockResolvedValue(null);
    const result = await createItem(validCreateInput);
    expect(result).toEqual({ success: false, error: "Failed to create item" });
    expect(mockDbCreate).toHaveBeenCalledWith(expect.objectContaining({ title: "New Snippet", userId: "user-1" }));
  });

  it("returns created item on success", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    const fakeItem = { id: "item-new", title: "New Snippet" };
    mockDbCreate.mockResolvedValue(fakeItem as never);
    const result = await createItem(validCreateInput);
    expect(result).toEqual({ success: true, data: fakeItem });
  });

  it("passes collectionIds to db create when provided", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    const fakeItem = { id: "item-new", title: "New Snippet" };
    mockDbCreate.mockResolvedValue(fakeItem as never);
    await createItem({ ...validCreateInput, collectionIds: ["col-1"] });
    expect(mockDbCreate).toHaveBeenCalledWith(
      expect.objectContaining({ collectionIds: ["col-1"] })
    );
  });

  it("passes empty collectionIds by default", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    const fakeItem = { id: "item-new", title: "New Snippet" };
    mockDbCreate.mockResolvedValue(fakeItem as never);
    await createItem(validCreateInput);
    expect(mockDbCreate).toHaveBeenCalledWith(
      expect.objectContaining({ collectionIds: [] })
    );
  });
});

describe("toggleItemPin action", () => {
  it("returns unauthorized when no session", async () => {
    mockAuth.mockResolvedValue(null as never);
    const result = await toggleItemPin("item-1", false);
    expect(result).toEqual({ success: false, error: "Unauthorized" });
    expect(mockDbSetPinned).not.toHaveBeenCalled();
  });

  it("returns unauthorized when session has no user id", async () => {
    mockAuth.mockResolvedValue({ user: {} } as never);
    const result = await toggleItemPin("item-1", false);
    expect(result).toEqual({ success: false, error: "Unauthorized" });
    expect(mockDbSetPinned).not.toHaveBeenCalled();
  });

  it("calls setItemPinned with negated isPinned (pin)", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockDbSetPinned.mockResolvedValue(true);
    const result = await toggleItemPin("item-1", false);
    expect(result).toEqual({ success: true });
    expect(mockDbSetPinned).toHaveBeenCalledWith("item-1", "user-1", true);
  });

  it("calls setItemPinned with negated isPinned (unpin)", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockDbSetPinned.mockResolvedValue(true);
    const result = await toggleItemPin("item-1", true);
    expect(result).toEqual({ success: true });
    expect(mockDbSetPinned).toHaveBeenCalledWith("item-1", "user-1", false);
  });

  it("returns error when db update fails", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockDbSetPinned.mockResolvedValue(false);
    const result = await toggleItemPin("item-1", false);
    expect(result).toEqual({ success: false, error: "Failed to update pin" });
  });
});

describe("toggleFavoriteItem action", () => {
  it("returns unauthorized when no session", async () => {
    mockAuth.mockResolvedValue(null as never);
    const result = await toggleFavoriteItem("item-1", false);
    expect(result).toEqual({ success: false, error: "Unauthorized" });
    expect(mockDbSetFavorite).not.toHaveBeenCalled();
  });

  it("returns unauthorized when session has no user id", async () => {
    mockAuth.mockResolvedValue({ user: {} } as never);
    const result = await toggleFavoriteItem("item-1", false);
    expect(result).toEqual({ success: false, error: "Unauthorized" });
    expect(mockDbSetFavorite).not.toHaveBeenCalled();
  });

  it("calls setItemFavorite with negated isFavorite (favorite)", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockDbSetFavorite.mockResolvedValue(true);
    const result = await toggleFavoriteItem("item-1", false);
    expect(result).toEqual({ success: true });
    expect(mockDbSetFavorite).toHaveBeenCalledWith("item-1", "user-1", true);
  });

  it("calls setItemFavorite with negated isFavorite (unfavorite)", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockDbSetFavorite.mockResolvedValue(true);
    const result = await toggleFavoriteItem("item-1", true);
    expect(result).toEqual({ success: true });
    expect(mockDbSetFavorite).toHaveBeenCalledWith("item-1", "user-1", false);
  });

  it("returns error when db update fails", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockDbSetFavorite.mockResolvedValue(false);
    const result = await toggleFavoriteItem("item-1", false);
    expect(result).toEqual({ success: false, error: "Failed to update favorite" });
  });
});
