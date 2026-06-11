"use client";

import { useState } from "react";
import MonacoEditor, { type BeforeMount } from "@monaco-editor/react";
import { Copy, Check, Sparkles, Loader2, Crown } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import { useEditorPreferences } from "@/contexts/EditorPreferencesContext";

interface ExplainResult {
  success: boolean;
  explanation?: string;
  error?: string;
}

interface CodeEditorProps {
  value: string;
  onChange?: (value: string) => void;
  language?: string;
  readOnly?: boolean;
  isPro?: boolean;
  onExplain?: () => Promise<ExplainResult>;
}

const LINE_HEIGHT = 20;
const PADDING = 24;
const MIN_HEIGHT = 80;
const MAX_HEIGHT = 400;

function calcHeight(value: string): number {
  const lines = value.split("\n").length;
  return Math.min(Math.max(lines * LINE_HEIGHT + PADDING, MIN_HEIGHT), MAX_HEIGHT);
}

const defineCustomThemes: BeforeMount = (monaco) => {
  monaco.editor.defineTheme("monokai", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "75715e", fontStyle: "italic" },
      { token: "keyword", foreground: "f92672" },
      { token: "string", foreground: "e6db74" },
      { token: "number", foreground: "ae81ff" },
      { token: "type", foreground: "66d9ef", fontStyle: "italic" },
      { token: "function", foreground: "a6e22e" },
      { token: "variable", foreground: "f8f8f2" },
    ],
    colors: {
      "editor.background": "#272822",
      "editor.foreground": "#f8f8f2",
      "editor.lineHighlightBackground": "#3e3d32",
      "editorCursor.foreground": "#f8f8f0",
      "editor.selectionBackground": "#49483e",
    },
  });

  monaco.editor.defineTheme("github-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "8b949e", fontStyle: "italic" },
      { token: "keyword", foreground: "ff7b72" },
      { token: "string", foreground: "a5d6ff" },
      { token: "number", foreground: "79c0ff" },
      { token: "type", foreground: "ffa657" },
      { token: "function", foreground: "d2a8ff" },
      { token: "variable", foreground: "e6edf3" },
    ],
    colors: {
      "editor.background": "#0d1117",
      "editor.foreground": "#e6edf3",
      "editor.lineHighlightBackground": "#161b22",
      "editorCursor.foreground": "#e6edf3",
      "editor.selectionBackground": "#264f78",
    },
  });
};

export function CodeEditor({ value, onChange, language = "plaintext", readOnly = false, isPro, onExplain }: CodeEditorProps) {
  const [copied, setCopied] = useState(false);
  const [explaining, setExplaining] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"code" | "explain">("code");
  const { preferences } = useEditorPreferences();

  function handleCopy() {
    const text = activeTab === "explain" && explanation ? explanation : value;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function handleExplain() {
    if (!onExplain) return;
    setExplaining(true);
    const result = await onExplain();
    setExplaining(false);
    if (!result.success) {
      toast.error(result.error ?? "Failed to explain code");
      return;
    }
    setExplanation(result.explanation ?? "");
    setActiveTab("explain");
  }

  const displayLang = language || "plaintext";
  const height = calcHeight(value);
  const showExplainControls = readOnly && !!onExplain;
  const hasExplanation = !!explanation;

  return (
    <div className="rounded-lg overflow-hidden border border-border bg-[#1e1e1e]">
      <div className="flex items-center justify-between px-3 py-2 bg-[#2d2d2d] border-b border-[#3a3a3a]">
        <div className="flex items-center gap-1.5">
          <span className="size-3 rounded-full bg-[#ff5f57]" />
          <span className="size-3 rounded-full bg-[#febc2e]" />
          <span className="size-3 rounded-full bg-[#28c840]" />
        </div>

        {hasExplanation ? (
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => setActiveTab("code")}
              className={`text-xs px-2 py-0.5 rounded transition-colors ${
                activeTab === "code" ? "bg-[#3a3a3a] text-[#cccccc]" : "text-[#858585] hover:text-[#cccccc]"
              }`}
            >
              Code
            </button>
            <button
              onClick={() => setActiveTab("explain")}
              className={`text-xs px-2 py-0.5 rounded transition-colors ${
                activeTab === "explain" ? "bg-[#3a3a3a] text-[#cccccc]" : "text-[#858585] hover:text-[#cccccc]"
              }`}
            >
              Explain
            </button>
          </div>
        ) : (
          <span className="text-xs text-[#858585] font-mono">{displayLang}</span>
        )}

        <div className="flex items-center gap-2">
          {showExplainControls && (
            isPro ? (
              <button
                onClick={handleExplain}
                disabled={explaining}
                className="flex items-center gap-1 text-xs text-[#858585] hover:text-[#cccccc] transition-colors disabled:opacity-50"
              >
                {explaining ? <Loader2 className="size-3.5 animate-spin" /> : <Sparkles className="size-3.5" />}
                <span>{explaining ? "Explaining…" : "Explain"}</span>
              </button>
            ) : (
              <span
                title="AI features require Pro subscription"
                className="flex items-center gap-1 text-xs text-[#858585] opacity-50 cursor-default"
              >
                <Crown className="size-3.5" />
                <span>Explain</span>
              </span>
            )
          )}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-xs text-[#858585] hover:text-[#cccccc] transition-colors"
          >
            {copied ? <Check className="size-3.5 text-green-400" /> : <Copy className="size-3.5" />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>
        </div>
      </div>

      {activeTab === "explain" && explanation ? (
        <div
          className="markdown-preview prose prose-invert prose-sm max-w-none px-4 py-3 overflow-y-auto"
          style={{ minHeight: MIN_HEIGHT, maxHeight: MAX_HEIGHT }}
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{explanation}</ReactMarkdown>
        </div>
      ) : (
        <MonacoEditor
          value={value}
          height={height}
          language={displayLang.toLowerCase()}
          theme={preferences.theme}
          beforeMount={defineCustomThemes}
          options={{
            readOnly,
            minimap: { enabled: preferences.minimap },
            scrollBeyondLastLine: false,
            fontSize: preferences.fontSize,
            tabSize: preferences.tabSize,
            lineHeight: LINE_HEIGHT,
            padding: { top: 12, bottom: 12 },
            wordWrap: preferences.wordWrap ? "on" : "off",
            scrollbar: {
              verticalScrollbarSize: 6,
              horizontalScrollbarSize: 6,
              useShadows: false,
            },
            overviewRulerLanes: 0,
            renderLineHighlight: readOnly ? "none" : "line",
            folding: false,
            lineNumbers: readOnly || !preferences.lineNumbers ? "off" : "on",
            glyphMargin: false,
            lineDecorationsWidth: readOnly || !preferences.lineNumbers ? 0 : 4,
            lineNumbersMinChars: readOnly || !preferences.lineNumbers ? 0 : 3,
          }}
          onChange={(val) => onChange?.(val ?? "")}
        />
      )}
    </div>
  );
}
