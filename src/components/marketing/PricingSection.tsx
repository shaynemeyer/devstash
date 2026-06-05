import FadeIn from "./FadeIn"
import PricingToggle from "./PricingToggle"

export default function PricingSection() {
  return (
    <section id="pricing" className="py-24 px-6 max-w-3xl mx-auto">
      <FadeIn className="text-center mb-4">
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-4">Simple pricing</p>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
          Start free, upgrade when ready
        </h2>
        <p className="text-muted-foreground">No hidden fees. Cancel anytime.</p>
      </FadeIn>

      <FadeIn className="mt-10">
        <PricingToggle />
      </FadeIn>
    </section>
  )
}
