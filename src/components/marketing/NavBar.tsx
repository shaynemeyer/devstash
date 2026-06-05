'use client'

import { useState, useEffect } from "react"
import Link from "next/link"

export default function NavBar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 h-16 transition-all duration-300 ${
        scrolled
          ? "bg-black/90 backdrop-blur-md border-b border-white/10"
          : "bg-black/40 backdrop-blur-md border-b border-transparent"
      }`}
    >
      <Link href="#" className="flex items-center gap-2 font-bold text-lg tracking-tight bg-linear-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none" width={28} height={28} aria-label="DevStash" role="img">
          <ellipse cx="16" cy="29.5" rx="10" ry="2" fill="black" opacity="0.14" />
          <polygon points="28,8 16,14 16,26 28,20" fill="#1e40af" />
          <polygon points="4,8 16,14 16,26 4,20" fill="#2563eb" />
          <polygon points="16,2 28,8 16,14 4,8" fill="#60a5fa" />
          <polygon points="14.5,2.75 17.5,2.75 17.5,13.25 14.5,13.25" fill="white" opacity="0.22" />
        </svg>
        DevStash
      </Link>

      <ul className="hidden md:flex items-center gap-8 list-none">
        <li>
          <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Features
          </a>
        </li>
        <li>
          <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Pricing
          </a>
        </li>
      </ul>

      <div className="flex items-center gap-3">
        <Link
          href="/sign-in"
          className="px-4 py-2 text-sm font-medium rounded-lg border border-white/10 text-muted-foreground hover:text-foreground hover:border-white/20 transition-all"
        >
          Sign In
        </Link>
        <Link
          href="/register"
          className="px-4 py-2 text-sm font-medium rounded-lg bg-linear-to-r from-blue-500 to-indigo-500 text-white hover:opacity-90 hover:-translate-y-px transition-all"
        >
          Get Started
        </Link>
      </div>
    </nav>
  )
}
