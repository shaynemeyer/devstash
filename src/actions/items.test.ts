import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/db/items", () => ({
  deleteItem: vi.fn(),
  updateItem: vi.fn(),
  createItem: vi.fn(),
}));

vi.mock("@/lib/r2", () => ({
  r2: { send: vi.fn().mockResolvedValue({}) },
  R2_BUCKET: "test-bucket",
}));

import { auth } from "@/auth";
import { r2 } from "@/lib/r2";
import { deleteItem as dbDeleteItem, updateItem as dbUpdateItem, createItem as dbCreateItem } from "@/lib/db/items";
import { deleteItem, updateItem, createItem } from "./items";

const mockAuth = vi.mocked(auth);
const mockR2Send = vi.mocked(r2.send);
const mockDbDelete = vi.mocked(dbDeleteItem);
const mockDbUpdate = vi.mocked(dbUpdateItem);
const mockDbCreate = vi.mocked(dbCreateItem);

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
});
