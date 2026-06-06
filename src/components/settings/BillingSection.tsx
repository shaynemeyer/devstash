"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface BillingSectionProps {
  isPro: boolean;
}

export function BillingSection({ isPro }: BillingSectionProps) {
  const [loading, setLoading] = useState<"monthly" | "yearly" | "portal" | null>(null);

  async function startCheckout(plan: "monthly" | "yearly") {
    setLoading(plan);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      window.location.href = data.url;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
      setLoading(null);
    }
  }

  async function openPortal() {
    setLoading("portal");
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      window.location.href = data.url;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
      setLoading(null);
    }
  }

  if (isPro) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-foreground">DevStash Pro</p>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
              Pro
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Unlimited items, collections, file uploads, and AI features.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          disabled={loading === "portal"}
          onClick={openPortal}
        >
          {loading === "portal" ? "Loading..." : "Manage Billing"}
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-4">
      <div>
        <p className="text-sm font-medium text-foreground">Upgrade to Pro</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Unlimited items &amp; collections, file and image uploads, AI features, and data export.
        </p>
      </div>
      <div className="flex gap-3">
        <Button
          size="sm"
          disabled={loading !== null}
          onClick={() => startCheckout("monthly")}
        >
          {loading === "monthly" ? "Loading..." : "$8 / month"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={loading !== null}
          onClick={() => startCheckout("yearly")}
        >
          {loading === "yearly" ? "Loading..." : "$72 / year (25% off)"}
        </Button>
      </div>
    </div>
  );
}
