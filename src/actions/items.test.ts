import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/db/items", () => ({
  deleteItem: vi.fn(),
  updateItem: vi.fn(),
}));

import { auth } from "@/auth";
import { deleteItem as dbDeleteItem, updateItem as dbUpdateItem } from "@/lib/db/items";
import { deleteItem, updateItem } from "./items";

const mockAuth = vi.mocked(auth);
const mockDbDelete = vi.mocked(dbDeleteItem);
const mockDbUpdate = vi.mocked(dbUpdateItem);

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
    mockDbDelete.mockResolvedValue(false);
    const result = await deleteItem("item-1");
    expect(result).toEqual({ success: false, error: "Failed to delete item" });
    expect(mockDbDelete).toHaveBeenCalledWith("item-1", "user-1");
  });

  it("returns success when item is deleted", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockDbDelete.mockResolvedValue(true);
    const result = await deleteItem("item-1");
    expect(result).toEqual({ success: true });
    expect(mockDbDelete).toHaveBeenCalledWith("item-1", "user-1");
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
