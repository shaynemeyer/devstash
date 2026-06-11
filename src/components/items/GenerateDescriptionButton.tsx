"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { generateDescription } from "@/actions/ai";

interface GenerateDescriptionButtonProps {
  title: string;
  content: string;
  itemType: string;
  isPro: boolean;
  onGenerated: (description: string) => void;
}

export function GenerateDescriptionButton({ title, content, itemType, isPro, onGenerated }: GenerateDescriptionButtonProps) {
  const [loading, setLoading] = useState(false);

  if (!isPro) return null;

  async function handleGenerate() {
    setLoading(true);
    const result = await generateDescription({ title, content, itemType });
    setLoading(false);
    if (!result.success) {
      toast.error(result.error ?? "Failed to generate description");
      return;
    }
    onGenerated(result.description ?? "");
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="h-7 gap-1.5 text-xs text-muted-foreground px-2"
      onClick={handleGenerate}
      disabled={loading || (!title.trim() && !content.trim())}
    >
      <Sparkles className="size-3" />
      {loading ? "Generating…" : "Generate"}
    </Button>
  );
}
