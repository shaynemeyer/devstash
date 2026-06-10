"use client";

import { useState } from "react";
import { Sparkles, Check, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { generateAutoTags } from "@/actions/ai";

interface SuggestTagsButtonProps {
  title: string;
  content: string;
  isPro: boolean;
  onAcceptTag: (tag: string) => void;
}

export function SuggestTagsButton({ title, content, isPro, onAcceptTag }: SuggestTagsButtonProps) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  if (!isPro) return null;

  async function handleSuggest() {
    setLoading(true);
    setSuggestions([]);
    const result = await generateAutoTags({ title, content });
    setLoading(false);
    if (!result.success) {
      toast.error(result.error ?? "Failed to generate tags");
      return;
    }
    setSuggestions(result.tags ?? []);
    if ((result.tags ?? []).length === 0) {
      toast.info("No tag suggestions returned");
    }
  }

  function acceptTag(tag: string) {
    onAcceptTag(tag);
    setSuggestions((prev) => prev.filter((t) => t !== tag));
  }

  function rejectTag(tag: string) {
    setSuggestions((prev) => prev.filter((t) => t !== tag));
  }

  return (
    <div className="mt-1.5 space-y-2">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-7 gap-1.5 text-xs text-muted-foreground px-2"
        onClick={handleSuggest}
        disabled={loading || !title.trim()}
      >
        <Sparkles className="size-3" />
        {loading ? "Suggesting…" : "Suggest Tags"}
      </Button>
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {suggestions.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md bg-primary/10 text-primary"
            >
              {tag}
              <button
                type="button"
                onClick={() => acceptTag(tag)}
                className="hover:text-green-500 transition-colors"
                aria-label={`Accept tag ${tag}`}
              >
                <Check className="size-3" />
              </button>
              <button
                type="button"
                onClick={() => rejectTag(tag)}
                className="hover:text-destructive transition-colors"
                aria-label={`Reject tag ${tag}`}
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
