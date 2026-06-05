'use client'

import { useState } from "react"
import Link from "next/link"

const FREE_FEATURES = [
  { text: "Up to 50 items", included: true },
  { text: "3 collections", included: true },
  { text: "All item types (text)", included: true },
  { text: "Full-text search", included: true },
  { text: "File & image uploads", included: false },
  { text: "AI features", included: false },
  { text: "Data export", included: false },
]

const PRO_FEATURES = [
  { text: "Unlimited items", included: true },
  { text: "Unlimited collections", included: true },
  { text: "File & image uploads", included: true },
  { text: "AI auto-tagging", included: true },
  { text: "AI summaries & explanations", included: true },
  { text: "Prompt optimizer", included: true },
  { text: "Export JSON / ZIP", included: true },
]

export default function PricingToggle() {
  const [yearly, setYearly] = useState(false)

  return (
    <>
      {/* Toggle */}
      <div className="flex items-center justify-center gap-4 mb-12">
        <span className="text-sm text-muted-foreground">Monthly</span>
        <button
          role="switch"
          aria-checked={yearly}
          onClick={() => setYearly((v) => !v)}
          className={`relative w-12 h-6 rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${yearly ? "bg-blue-500" : "bg-border"}`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-200 ${yearly ? "translate-x-6" : "translate-x-0"}`}
          />
        </button>
        <span className="text-sm text-muted-foreground">Yearly</span>
        <span className="px-2 py-0.5 text-xs rounded-full text-green-400 border border-green-500/30 bg-green-500/15">
          Save 25%
        </span>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Free */}
        <div className="bg-card border border-border rounded-2xl p-9">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Free</p>
          <p className="text-5xl font-extrabold tracking-tighter leading-none mb-1">$0</p>
          <p className="text-xs text-muted-foreground mb-8">forever</p>
          <hr className="border-border mb-6" />
          <ul className="flex flex-col gap-3 mb-8">
            {FREE_FEATURES.map((f) => (
              <li key={f.text} className="flex items-center gap-2.5 text-sm">
                <span className={f.included ? "text-green-400" : "text-muted-foreground/40"}>
                  {f.included ? "✓" : "✗"}
                </span>
                <span className={f.included ? "" : "text-muted-foreground/50"}>{f.text}</span>
              </li>
            ))}
          </ul>
          <Link
            href="/register"
            className="block w-full text-center py-3.5 rounded-xl font-semibold text-sm border border-border hover:bg-white/5 hover:border-white/20 transition-all"
          >
            Get Started Free
          </Link>
        </div>

        {/* Pro */}
        <div className="relative bg-linear-to-b from-blue-500/[0.07] to-card border border-blue-500 rounded-2xl p-9">
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-semibold bg-linear-to-r from-blue-500 to-indigo-500 text-white whitespace-nowrap">
            Most Popular
          </span>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Pro</p>
          <p className="text-5xl font-extrabold tracking-tighter leading-none mb-1">
            {yearly ? "$6" : "$8"}
            <span className="text-xl font-medium text-muted-foreground">/mo</span>
          </p>
          <p className="text-xs text-muted-foreground mb-8">
            {yearly ? "billed $72/yr" : "billed monthly"}
          </p>
          <hr className="border-border mb-6" />
          <ul className="flex flex-col gap-3 mb-8">
            {PRO_FEATURES.map((f) => (
              <li key={f.text} className="flex items-center gap-2.5 text-sm">
                <span className="text-green-400">✓</span>
                {f.text}
              </li>
            ))}
          </ul>
          <Link
            href="/register"
            className="block w-full text-center py-3.5 rounded-xl font-semibold text-sm bg-linear-to-r from-blue-500 to-indigo-500 text-white hover:opacity-90 hover:-translate-y-px transition-all"
          >
            Start Pro — {yearly ? "$72/yr" : "$8/mo"}
          </Link>
        </div>
      </div>
    </>
  )
}
