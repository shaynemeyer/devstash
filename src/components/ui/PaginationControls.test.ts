import { describe, it, expect } from "vitest";
import { getPageNumbers } from "./PaginationControls";

describe("getPageNumbers", () => {
  it("returns all pages when total <= 7", () => {
    expect(getPageNumbers(1, 5)).toEqual([1, 2, 3, 4, 5]);
    expect(getPageNumbers(3, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it("no leading ellipsis when current is near the start", () => {
    // current=2: start=max(2,1)=1, end=min(8,3)=3 — no leading ellipsis
    const result = getPageNumbers(2, 10);
    expect(result[0]).toBe(1);
    expect(result[1]).not.toBeNull(); // no ellipsis after page 1
  });

  it("shows trailing ellipsis when current is near the start", () => {
    const result = getPageNumbers(1, 10);
    expect(result).toEqual([1, 2, null, 10]);
  });

  it("shows leading ellipsis when current is near the end", () => {
    const result = getPageNumbers(10, 10);
    expect(result).toEqual([1, null, 9, 10]);
  });

  it("shows both ellipses when current is in the middle", () => {
    const result = getPageNumbers(5, 10);
    expect(result[0]).toBe(1);
    expect(result[1]).toBeNull();
    expect(result[result.length - 1]).toBe(10);
    expect(result[result.length - 2]).toBeNull();
  });

  it("always includes first and last page", () => {
    for (const current of [1, 4, 7, 10]) {
      const result = getPageNumbers(current, 10);
      expect(result[0]).toBe(1);
      expect(result[result.length - 1]).toBe(10);
    }
  });

  it("active page and its neighbours are always included", () => {
    const result = getPageNumbers(6, 12);
    expect(result).toContain(5);
    expect(result).toContain(6);
    expect(result).toContain(7);
  });
});
