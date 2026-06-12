"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Copy, Check } from "lucide-react";
import { AIFeatureButton } from "@/components/ai/AIFeatureButton";
import { toast } from "sonner";

interface OptimizeResult {
  success: boolean;
  optimizedPrompt?: string;
  error?: string;
}

interface MarkdownEditorProps {
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  isPro?: boolean;
  onOptimize?: () => Promise<OptimizeResult>;
  onApplyOptimized?: (text: string) => void;
}

const MIN_HEIGHT = 80;
const MAX_HEIGHT = 400;

function calcHeight(value: string): number {
  const lines = value.split("\n").length;
  return Math.min(Math.max(lines * 20 + 24, MIN_HEIGHT), MAX_HEIGHT);
}

export function MarkdownEditor({
  value,
  onChange,
  readOnly = false,
  isPro,
  onOptimize,
  onApplyOptimized,
}: MarkdownEditorProps) {
  const [tab, setTab] = useState<"write" | "preview">(readOnly ? "preview" : "write");
  const [copied, setCopied] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [optimizedText, setOptimizedText] = useState<string | null>(null);

  useEffect(() => {
    setTab(readOnly ? "preview" : "write");
  }, [readOnly]);

  function handleCopy() {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function handleOptimize() {
    if (!onOptimize) return;
    setOptimizing(true);
    const result = await onOptimize();
    setOptimizing(false);
    if (!result.success) {
      toast.error(result.error ?? "Failed to optimize prompt");
      return;
    }
    setOptimizedText(result.optimizedPrompt ?? "");
  }

  function handleApply() {
    if (!optimizedText) return;
    onApplyOptimized?.(optimizedText);
    toast.success("Prompt updated — review and save");
    setOptimizedText(null);
  }

  const height = calcHeight(value);
  const showOptimizeControl = readOnly && !!onOptimize;

  return (
    <div className="rounded-lg overflow-hidden border border-border bg-[#1e1e1e]">
      <div className="flex items-center justify-between px-3 py-2 bg-[#2d2d2d] border-b border-[#3a3a3a]">
        <div className="flex items-center gap-1.5">
          {!readOnly && (
            <>
              <button
                onClick={() => setTab("write")}
                className={`text-sm px-2 py-0.5 rounded transition-colors ${
                  tab === "write"
                    ? "bg-[#3a3a3a] text-[#cccccc]"
                    : "text-[#858585] hover:text-[#cccccc]"
                }`}
              >
                Write
              </button>
              <button
                onClick={() => setTab("preview")}
                className={`text-sm px-2 py-0.5 rounded transition-colors ${
                  tab === "preview"
                    ? "bg-[#3a3a3a] text-[#cccccc]"
                    : "text-[#858585] hover:text-[#cccccc]"
                }`}
              >
                Preview
              </button>
            </>
          )}
          {readOnly && <span className="text-sm text-[#858585]">Markdown</span>}
        </div>
        <div className="flex items-center gap-2">
          {showOptimizeControl && (
            <AIFeatureButton
              label="Optimize"
              loadingLabel="Optimizing…"
              loading={optimizing}
              isPro={isPro}
              onClick={handleOptimize}
            />
          )}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-sm text-[#858585] hover:text-[#cccccc] transition-colors"
          >
            {copied ? <Check className="size-3.5 text-green-400" /> : <Copy className="size-3.5" />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>
        </div>
      </div>

      {tab === "write" && !readOnly ? (
        <textarea
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          style={{ minHeight: MIN_HEIGHT, maxHeight: MAX_HEIGHT, height }}
          className="w-full resize-none bg-[#1e1e1e] text-[#d4d4d4] text-base font-mono px-4 py-3 focus:outline-none"
          placeholder="Write markdown..."
          spellCheck={false}
        />
      ) : (
        <div
          className="markdown-preview prose prose-invert prose-base max-w-none px-4 py-3 overflow-y-auto"
          style={{ minHeight: MIN_HEIGHT, maxHeight: MAX_HEIGHT }}
        >
          {value ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
          ) : (
            <p className="text-[#858585] italic">Nothing to preview.</p>
          )}
        </div>
      )}

      {optimizedText !== null && (
        <div className="border-t border-[#3a3a3a] bg-[#1a1a2e] px-4 py-3 space-y-2">
          <p className="text-xs font-medium text-[#858585] uppercase tracking-wide">Optimized</p>
          <div
            className="text-sm text-[#d4d4d4] overflow-y-auto"
            style={{ maxHeight: 200 }}
          >
            {optimizedText}
          </div>
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleApply}
              className="text-xs px-3 py-1 rounded bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Use This
            </button>
            <button
              onClick={() => setOptimizedText(null)}
              className="text-xs px-3 py-1 rounded text-[#858585] hover:text-[#cccccc] transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
