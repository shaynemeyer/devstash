"use client";

import { useState } from "react";
import MonacoEditor from "@monaco-editor/react";
import { Copy, Check } from "lucide-react";

interface CodeEditorProps {
  value: string;
  onChange?: (value: string) => void;
  language?: string;
  readOnly?: boolean;
}

const LINE_HEIGHT = 20;
const PADDING = 24;
const MIN_HEIGHT = 80;
const MAX_HEIGHT = 400;

function calcHeight(value: string): number {
  const lines = value.split("\n").length;
  return Math.min(Math.max(lines * LINE_HEIGHT + PADDING, MIN_HEIGHT), MAX_HEIGHT);
}

export function CodeEditor({ value, onChange, language = "plaintext", readOnly = false }: CodeEditorProps) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const displayLang = language || "plaintext";
  const height = calcHeight(value);

  return (
    <div className="rounded-lg overflow-hidden border border-border bg-[#1e1e1e]">
      {/* macOS window chrome */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#2d2d2d] border-b border-[#3a3a3a]">
        <div className="flex items-center gap-1.5">
          <span className="size-3 rounded-full bg-[#ff5f57]" />
          <span className="size-3 rounded-full bg-[#febc2e]" />
          <span className="size-3 rounded-full bg-[#28c840]" />
        </div>
        <span className="text-xs text-[#858585] font-mono">{displayLang}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-xs text-[#858585] hover:text-[#cccccc] transition-colors"
        >
          {copied ? <Check className="size-3.5 text-green-400" /> : <Copy className="size-3.5" />}
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>
      <MonacoEditor
        value={value}
        height={height}
        language={displayLang.toLowerCase()}
        theme="vs-dark"
        options={{
          readOnly,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          fontSize: 13,
          lineHeight: LINE_HEIGHT,
          padding: { top: 12, bottom: 12 },
          wordWrap: "on",
          scrollbar: {
            verticalScrollbarSize: 6,
            horizontalScrollbarSize: 6,
            useShadows: false,
          },
          overviewRulerLanes: 0,
          renderLineHighlight: readOnly ? "none" : "line",
          folding: false,
          lineNumbers: readOnly ? "off" : "on",
          glyphMargin: false,
          lineDecorationsWidth: readOnly ? 0 : 4,
          lineNumbersMinChars: readOnly ? 0 : 3,
        }}
        onChange={(val) => onChange?.(val ?? "")}
      />
    </div>
  );
}
