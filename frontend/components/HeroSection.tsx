"use client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import { ArrowRight } from "lucide-react"
import Image from "next/image"

export function HeroSection() {
  return (
    <section className="py-20 md:py-32 bg-gradient-to-br from-blue-50 to-indigo-100">
    <div className="container px-4 md:px-6">
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
        <div className="space-y-8">
          <div className="space-y-4">
            <Badge variant="secondary" className="w-fit">
              🚀 Makson Markovich LOX :P
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Streamline Your
              <span className="text-blue-600"> Workflow</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-[600px]">
              Boost productivity by 300% with our intelligent automation platform. Connect your tools, automate
              repetitive tasks, and focus on what matters most.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="text-lg px-8">
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 bg-transparent">
              Watch Demo
            </Button>
          </div>

          <div className="flex items-center space-x-8 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <Check className="h-4 w-4 text-green-600" />
              <span>14-day free trial</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="h-4 w-4 text-green-600" />
              <span>No credit card required</span>
            </div>
          </div>
        </div>

        <div className="relative">
          <Image
            src="/hero_photo.jpeg"
            alt="StreamLine Dashboard"
            width={400}
            height={100}
            className="rounded-xl shadow-2xl"
          />
        </div>
      </div>
    </div>
  </section>

  )
}