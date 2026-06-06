import { describe, it, expect } from "vitest";
import { CheckoutSchema } from "./stripe";

describe("CheckoutSchema", () => {
  it("accepts monthly plan", () => {
    const result = CheckoutSchema.safeParse({ plan: "monthly" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.plan).toBe("monthly");
  });

  it("accepts yearly plan", () => {
    const result = CheckoutSchema.safeParse({ plan: "yearly" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.plan).toBe("yearly");
  });

  it("rejects an invalid plan value", () => {
    const result = CheckoutSchema.safeParse({ plan: "weekly" });
    expect(result.success).toBe(false);
  });

  it("rejects missing plan", () => {
    const result = CheckoutSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects empty string plan", () => {
    const result = CheckoutSchema.safeParse({ plan: "" });
    expect(result.success).toBe(false);
  });
});
