'use client'

import { useEffect, useRef, ReactNode } from "react"
import { cn } from "@/lib/utils"

const FADE_IN_THRESHOLD = 0.12

interface FadeInProps {
  children: ReactNode
  className?: string
}

export default function FadeIn({ children, className }: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("marketing-visible")
          obs.unobserve(el)
        }
      },
      { threshold: FADE_IN_THRESHOLD }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div ref={ref} className={cn("marketing-fade-in", className)}>
      {children}
    </div>
  )
}
