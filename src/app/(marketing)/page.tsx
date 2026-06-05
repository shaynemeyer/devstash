import { auth } from "@/auth"
import { redirect } from "next/navigation"
import NavBar from "@/components/marketing/NavBar"
import HeroSection from "@/components/marketing/HeroSection"
import FeaturesSection from "@/components/marketing/FeaturesSection"
import AISection from "@/components/marketing/AISection"
import PricingSection from "@/components/marketing/PricingSection"
import CTASection from "@/components/marketing/CTASection"
import Footer from "@/components/marketing/Footer"

export default async function HomePage() {
  const session = await auth()
  if (session) redirect("/dashboard")

  return (
    <>
      <NavBar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <AISection />
        <PricingSection />
        <CTASection />
      </main>
      <Footer />
    </>
  )
}
