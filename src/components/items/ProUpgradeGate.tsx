"use client";

import { useState } from "react";
import { LockIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface ProUpgradeGateProps {
  feature: string;
}

export function ProUpgradeGate({ feature }: ProUpgradeGateProps) {
  const [loading, setLoading] = useState<"monthly" | "yearly" | null>(null);

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

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center gap-6">
      <div className="flex items-center justify-center size-16 rounded-full bg-primary/10">
        <LockIcon className="size-8 text-primary" />
      </div>
      <div className="space-y-2 max-w-sm">
        <h2 className="text-xl font-semibold text-foreground">{feature} is a Pro feature</h2>
        <p className="text-sm text-muted-foreground">
          Upgrade to DevStash Pro to upload and manage {feature.toLowerCase()}, plus get unlimited
          items, collections, and AI features.
        </p>
      </div>
      <div className="flex gap-3">
        <Button onClick={() => startCheckout("monthly")} disabled={loading !== null}>
          {loading === "monthly" ? "Redirecting…" : "Upgrade — $8/mo"}
        </Button>
        <Button variant="outline" onClick={() => startCheckout("yearly")} disabled={loading !== null}>
          {loading === "yearly" ? "Redirecting…" : "Upgrade — $72/yr"}
        </Button>
      </div>
    </div>
  );
}
