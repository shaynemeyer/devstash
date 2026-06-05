import FadeIn from "./FadeIn"

const CHECKLIST = [
  "Auto-tag suggestions based on content",
  "One-click item summaries",
  "Explain This Code — instant breakdowns",
  "Prompt optimizer for better AI outputs",
]

export default function AISection() {
  return (
    <section className="py-24 px-6 bg-card/50">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Text */}
        <FadeIn>
          <span className="inline-block px-3 py-1 mb-5 text-xs font-semibold tracking-widest text-amber-300 rounded-full border border-amber-500/30 bg-amber-500/10">
            Pro Feature
          </span>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            AI that understands<br />your code
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-8">
            Let AI do the heavy lifting. Auto-tag your items, generate summaries, explain complex code,
            and optimize your prompts — all without leaving DevStash.
          </p>
          <ul className="flex flex-col gap-3">
            {CHECKLIST.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm">
                <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-green-400 text-[0.6rem] bg-green-500/20 border border-green-500/40">
                  ✓
                </span>
                {item}
              </li>
            ))}
          </ul>
        </FadeIn>

        {/* Code editor mockup */}
        <FadeIn>
          <div className="rounded-2xl overflow-hidden border border-border font-mono text-sm" style={{ background: "#0d0d14" }}>
            {/* Editor titlebar */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border" style={{ background: "#111118" }}>
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
              <span className="ml-2 text-xs text-muted-foreground font-sans">useDebounce.ts</span>
            </div>
            {/* Code */}
            <div className="px-5 py-5 text-xs leading-7">
              {[
                [<span key="kw" className="text-indigo-400">import</span>, " { useState, useEffect } ", <span key="kw2" className="text-indigo-400">from</span>, " ", <span key="str" className="text-emerald-400">&apos;react&apos;</span>],
                [],
                [<span key="kw" className="text-indigo-400">export function</span>, " ", <span key="fn" className="text-blue-400">useDebounce</span>, <span key="t">&lt;T&gt;(</span>],
                ["  value: T, delay: ", <span key="kw" className="text-indigo-400">number</span>],
                ["): T {"],
                ["  ", <span key="kw" className="text-indigo-400">const</span>, " [debounced, setDebounced] ="],
                ["    ", <span key="fn" className="text-blue-400">useState</span>, "(value)"],
                [],
                ["  ", <span key="fn" className="text-blue-400">useEffect</span>, "(() ", <span key="op" className="text-red-400">=&gt;</span>, " {"],
                ["    ", <span key="kw" className="text-indigo-400">const</span>, " t = ", <span key="fn" className="text-blue-400">setTimeout</span>, "(() ", <span key="op" className="text-red-400">=&gt;</span>],
                ["      ", <span key="fn" className="text-blue-400">setDebounced</span>, "(value), delay)"],
                ["    ", <span key="kw" className="text-indigo-400">return</span>, " () ", <span key="op" className="text-red-400">=&gt;</span>, " ", <span key="fn" className="text-blue-400">clearTimeout</span>, "(t)"],
                ["  }, [value, delay])"],
                ["  ", <span key="kw" className="text-indigo-400">return</span>, " debounced"],
                ["}"],
              ].map((line, i) => (
                <div key={i} className="flex gap-4">
                  <span className="select-none text-zinc-700 w-5 text-right flex-shrink-0">{i + 1}</span>
                  <span>{line}</span>
                </div>
              ))}
            </div>
            {/* AI tags */}
            <div className="flex flex-wrap items-center gap-2 px-5 py-3 border-t border-border" style={{ background: "#111118" }}>
              <span className="text-[0.65rem] text-muted-foreground font-sans">AI Generated Tags:</span>
              {[
                { label: "react", bg: "#3b82f626", color: "#60a5fa", border: "#3b82f64d" },
                { label: "hooks", bg: "#06b6d426", color: "#67e8f9", border: "#06b6d44d" },
                { label: "typescript", bg: "#f59e0b26", color: "#fcd34d", border: "#f59e0b4d" },
                { label: "performance", bg: "#22c55e26", color: "#86efac", border: "#22c55e4d" },
                { label: "utility", bg: "#6366f126", color: "#a5b4fc", border: "#6366f14d" },
              ].map((tag) => (
                <span
                  key={tag.label}
                  className="px-2 py-0.5 text-[0.65rem] rounded-full font-sans"
                  style={{ background: tag.bg, color: tag.color, border: `1px solid ${tag.border}` }}
                >
                  {tag.label}
                </span>
              ))}
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
