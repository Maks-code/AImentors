"use client"

import { useEffect } from "react"

import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { HeroSection } from "@/components/HeroSection"
import { MentorCarousel } from "@/components/MentorCarousel"
import { FeaturesSection } from "@/components/FeaturesSection"
import { TestimonialsSection } from "@/components/Testimonials"
import { FinalCtaSection } from "@/components/FinalCtaSection"
import { SubscriptionsShowcase } from "@/components/SubscriptionsShowcase"
import { PricingSection } from "@/components/pricing"

export default function OnboardingPage() {
  useEffect(() => {
    if (typeof document === "undefined") return

    const root = document.documentElement
    const body = document.body
    const hadDarkClass = root.classList.contains("dark")
    const previousThemeAttr = root.getAttribute("data-theme")
    const previousColorScheme = body?.style.colorScheme ?? ""

    root.classList.remove("dark")
    root.setAttribute("data-theme", "light")
    if (body) {
      body.style.colorScheme = "light"
    }

    return () => {
      if (hadDarkClass) {
        root.classList.add("dark")
      } else {
        root.classList.remove("dark")
      }

      if (previousThemeAttr) {
        root.setAttribute("data-theme", previousThemeAttr)
      } else {
        root.removeAttribute("data-theme")
      }

      if (body) {
        body.style.colorScheme = previousColorScheme
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navbar />
      <HeroSection />
      <MentorCarousel />
      <FeaturesSection />
      <TestimonialsSection />
      <SubscriptionsShowcase />
      <PricingSection variant="default" />
      <FinalCtaSection />
      <Footer />
    </div>
  )
}
