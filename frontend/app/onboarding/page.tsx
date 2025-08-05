import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { HeroSection } from "@/components/HeroSection"
import { MentorCarousel } from "@/components/MentorCarousel"
import { FeaturesSection } from "@/components/FeaturesSection"
import { TestimonialsSection } from "@/components/Testimonials"
import { PricingSection } from "@/components/pricing"
import { FinalCtaSection } from "@/components/FinalCtaSection"

export default function OnboardingPage() {
  return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <HeroSection />
        <MentorCarousel />
        <FeaturesSection />
        <TestimonialsSection />
        <PricingSection variant="default" />
        <FinalCtaSection />
        <Footer />
      </div>
  )
}