import Link from "next/link"
import FadeIn from "./FadeIn"
import ChaosArena from "./ChaosArena"

export default function HeroSection() {
  return (
    <section className="relative pt-28 pb-20 px-6 text-center overflow-hidden">
      {/* Background gradient */}
      <div
        className="absolute inset-0 pointer-events-none opacity-15"
        style={{ background: "linear-gradient(135deg, #3b82f620 0%, #6366f120 50%, #ec489920 100%)" }}
      />

      {/* Text */}
      <FadeIn className="max-w-3xl mx-auto mb-16 relative">
        <span className="inline-block px-3 py-1 mb-6 text-xs tracking-widest text-indigo-300 rounded-full border border-indigo-500/30 bg-indigo-500/10">
          Developer Knowledge Hub
        </span>
        <h1 className="text-5xl md:text-6xl font-extrabold leading-tight tracking-tighter mb-5 bg-linear-to-br from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
          Stop Losing Your<br />Developer Knowledge
        </h1>
        <p className="text-lg text-muted-foreground max-w-lg mx-auto mb-8">
          Snippets, prompts, commands, notes, and links — all in one fast, searchable, AI-powered place.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            href="/register"
            className="px-7 py-3.5 text-base font-semibold rounded-xl bg-linear-to-r from-blue-500 to-indigo-500 text-white hover:opacity-90 hover:-translate-y-px transition-all"
          >
            Get Started Free
          </Link>
          <a
            href="#features"
            className="px-7 py-3.5 text-base font-medium rounded-xl border border-white/10 text-foreground hover:bg-white/5 hover:border-white/20 transition-all"
          >
            See Features
          </a>
        </div>
      </FadeIn>

      {/* Chaos → Order visual */}
      <FadeIn className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-6 max-w-4xl mx-auto items-center">
        {/* Chaos box */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-4 py-3 text-xs text-muted-foreground uppercase tracking-widest border-b border-border text-left">
            Your knowledge today...
          </div>
          <ChaosArena />
        </div>

        {/* Arrow */}
        <div className="flex flex-col items-center gap-2 lg:flex-col">
          <span className="text-[0.65rem] text-muted-foreground uppercase tracking-widest whitespace-nowrap">
            bring it together
          </span>
          <svg
            width="48"
            height="48"
            viewBox="0 0 48 48"
            fill="none"
            className="lg:rotate-0 rotate-90 animate-pulse-arrow"
          >
            <path
              d="M10 24H38M38 24L26 12M38 24L26 36"
              stroke="#6366f1"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Dashboard preview */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-4 py-3 text-xs text-muted-foreground uppercase tracking-widest border-b border-border text-left">
            ...with DevStash
          </div>
          <div className="flex h-70">
            {/* Sidebar */}
            <div className="w-24 border-r border-border p-2 flex flex-col gap-1">
              {[
                { label: "Snippets", color: "#3b82f6", active: true },
                { label: "Prompts", color: "#8b5cf6" },
                { label: "Commands", color: "#f97316" },
                { label: "Notes", color: "#fde047" },
                { label: "Links", color: "#10b981" },
                { label: "Images", color: "#ec4899" },
              ].map((item) => (
                <div
                  key={item.label}
                  className={`flex items-center gap-1.5 px-1.5 py-1 rounded-md text-[0.6rem] ${
                    item.active ? "bg-indigo-500/15 text-indigo-300" : "text-muted-foreground"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: item.color }} />
                  {item.label}
                </div>
              ))}
            </div>
            {/* Cards grid */}
            <div className="flex-1 p-2 grid grid-cols-2 grid-rows-3 gap-1.5 overflow-hidden">
              {[
                "#3b82f6", "#8b5cf6", "#f97316",
                "#fde047", "#10b981", "#ec4899",
              ].map((color) => (
                <div
                  key={color}
                  className="rounded-md p-1.5"
                  style={{ background: "hsl(var(--card))", borderTop: `2px solid ${color}` }}
                >
                  <div className="h-1 rounded-sm mb-1 w-3/4" style={{ background: `${color}40` }} />
                  <div className="h-1 rounded-sm w-11/12 bg-white/5" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </FadeIn>
    </section>
  )
}
