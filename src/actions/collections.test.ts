import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/db/collections", () => ({
  createCollection: vi.fn(),
}));

import { auth } from "@/auth";
import { createCollection as dbCreateCollection } from "@/lib/db/collections";
import { createCollection } from "./collections";

const mockAuth = vi.mocked(auth);
const mockDbCreate = vi.mocked(dbCreateCollection);

beforeEach(() => {
  vi.clearAllMocks();
});

const validInput = { name: "My Collection" };

describe("createCollection action", () => {
  it("returns unauthorized when no session", async () => {
    mockAuth.mockResolvedValue(null as never);
    const result = await createCollection(validInput);
    expect(result).toEqual({ success: false, error: "Unauthorized" });
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
