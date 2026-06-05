import Link from "next/link"
import FadeIn from "./FadeIn"

export default function CTASection() {
  return (
    <section className="py-20 px-6 text-center bg-card/50">
      <FadeIn className="max-w-xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
          Ready to organize your<br />developer knowledge?
        </h2>
        <p className="text-muted-foreground mb-8">
          Join developers who stopped losing things and started building faster.
        </p>
        <Link
          href="/register"
          className="inline-block px-8 py-4 text-base font-semibold rounded-xl bg-linear-to-r from-blue-500 to-indigo-500 text-white hover:opacity-90 hover:-translate-y-px transition-all"
        >
          Get Started Free
        </Link>
      </FadeIn>
    </section>
  )
}
