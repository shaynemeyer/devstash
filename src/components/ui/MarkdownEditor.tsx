"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Copy, Check } from "lucide-react";

interface MarkdownEditorProps {
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
}

const MIN_HEIGHT = 80;
const MAX_HEIGHT = 400;

function calcHeight(value: string): number {
  const lines = value.split("\n").length;
  return Math.min(Math.max(lines * 20 + 24, MIN_HEIGHT), MAX_HEIGHT);
}

export function MarkdownEditor({ value, onChange, readOnly = false }: MarkdownEditorProps) {
  const [tab, setTab] = useState<"write" | "preview">(readOnly ? "preview" : "write");
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const height = calcHeight(value);

  return (
    <div className="rounded-lg overflow-hidden border border-border bg-[#1e1e1e]">
      <div className="flex items-center justify-between px-3 py-2 bg-[#2d2d2d] border-b border-[#3a3a3a]">
        <div className="flex items-center gap-1.5">
          {!readOnly && (
            <>
              <button
                onClick={() => setTab("write")}
                className={`text-xs px-2 py-0.5 rounded transition-colors ${
                  tab === "write"
                    ? "bg-[#3a3a3a] text-[#cccccc]"
                    : "text-[#858585] hover:text-[#cccccc]"
                }`}
              >
                Write
              </button>
              <button
                onClick={() => setTab("preview")}
                className={`text-xs px-2 py-0.5 rounded transition-colors ${
                  tab === "preview"
                    ? "bg-[#3a3a3a] text-[#cccccc]"
                    : "text-[#858585] hover:text-[#cccccc]"
                }`}
              >
                Preview
              </button>
            </>
          )}
          {readOnly && <span className="text-xs text-[#858585]">Markdown</span>}
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-xs text-[#858585] hover:text-[#cccccc] transition-colors"
        >
          {copied ? <Check className="size-3.5 text-green-400" /> : <Copy className="size-3.5" />}
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>

      {tab === "write" && !readOnly ? (
        <textarea
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          style={{ minHeight: MIN_HEIGHT, maxHeight: MAX_HEIGHT, height }}
          className="w-full resize-none bg-[#1e1e1e] text-[#d4d4d4] text-sm font-mono px-4 py-3 focus:outline-none"
          placeholder="Write markdown..."
          spellCheck={false}
        />
      ) : (
        <div
          className="markdown-preview prose prose-invert prose-sm max-w-none px-4 py-3 overflow-y-auto"
          style={{ minHeight: MIN_HEIGHT, maxHeight: MAX_HEIGHT }}
        >
          {value ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
          ) : (
            <p className="text-[#858585] italic">Nothing to preview.</p>
          )}
        </div>
      )}
    </div>
  );
}
