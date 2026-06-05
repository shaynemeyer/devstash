import { Code, Sparkles, Terminal, FileText, File, Link } from "lucide-react"
import FadeIn from "./FadeIn"

const FEATURES = [
  {
    icon: Code,
    title: "Code Snippets",
    description: "Save reusable code with syntax highlighting. Find them instantly with full-text search.",
    color: "#3b82f6",
  },
  {
    icon: Sparkles,
    title: "AI Prompts",
    description: "Build your personal prompt library. Organize system messages, workflows, and context files.",
    color: "#8b5cf6",
  },
  {
    icon: Terminal,
    title: "Commands",
    description: "Never forget a CLI command again. Document flags, examples, and context alongside each one.",
    color: "#f97316",
  },
  {
    icon: FileText,
    title: "Notes",
    description: "Capture ideas, documentation, and references in a fast markdown editor. Always at your fingertips.",
    color: "#fde047",
  },
  {
    icon: File,
    title: "Files & Images",
    description: "Upload reference files, context documents, and boilerplate. Keep them alongside your items.",
    color: "#6b7280",
  },
  {
    icon: Link,
    title: "Links",
    description: "Bookmark URLs with context. Never lose an article, tool, or resource again.",
    color: "#10b981",
  },
]

export default function FeaturesSection() {
  return (
    <section id="features" className="py-24 px-6 max-w-6xl mx-auto">
      <FadeIn className="text-center mb-14">
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-4">Everything you need</p>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
          One place for all your dev knowledge
        </h2>
        <p className="text-muted-foreground text-base max-w-md mx-auto">
          Stop switching between tools. Store, search, and reuse everything in seconds.
        </p>
      </FadeIn>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {FEATURES.map((feature) => {
          const Icon = feature.icon
          return (
            <FadeIn key={feature.title}>
              <div className="bg-card border border-border rounded-2xl p-7 hover:-translate-y-1 hover:border-white/20 transition-all duration-200">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${feature.color}26`, color: feature.color }}
                >
                  <Icon size={20} />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            </FadeIn>
          )
        })}
      </div>
    </section>
  )
}
