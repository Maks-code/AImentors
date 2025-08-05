"use client"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardFooter, CardDescription } from "@/components/ui/card"
import { Star } from "lucide-react"
import Image from "next/image"

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-20 md:py-32 bg-gray-50">
    <div className="container px-4 md:px-6">
      <div className="text-center space-y-4 mb-16">
        <Badge variant="outline" className="w-fit mx-auto">
          Testimonials
        </Badge>
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">Loved by teams worldwide</h2>
        <p className="text-xl text-muted-foreground max-w-[800px] mx-auto">
          See what our customers have to say about StreamLine
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center space-x-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <CardDescription className="text-base">
              "StreamLine has completely transformed our workflow. We've reduced manual tasks by 80% and our team is
              more productive than ever."
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <div className="flex items-center space-x-3">
              <Image
                src="/placeholder.svg?height=40&width=40"
                alt="Sarah Johnson"
                width={40}
                height={40}
                className="rounded-full"
              />
              <div>
                <p className="font-semibold">Sarah Johnson</p>
                <p className="text-sm text-muted-foreground">VP of Operations, TechCorp</p>
              </div>
            </div>
          </CardFooter>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center space-x-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <CardDescription className="text-base">
              "The automation capabilities are incredible. What used to take hours now happens automatically. Our
              ROI was positive within the first month."
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <div className="flex items-center space-x-3">
              <Image
                src="/placeholder.svg?height=40&width=40"
                alt="Michael Chen"
                width={40}
                height={40}
                className="rounded-full"
              />
              <div>
                <p className="font-semibold">Michael Chen</p>
                <p className="text-sm text-muted-foreground">CTO, StartupXYZ</p>
              </div>
            </div>
          </CardFooter>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center space-x-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <CardDescription className="text-base">
              "StreamLine's security features give us peace of mind. We can automate sensitive processes knowing our
              data is protected."
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <div className="flex items-center space-x-3">
              <Image
                src="/placeholder.svg?height=40&width=40"
                alt="Emily Rodriguez"
                width={40}
                height={40}
                className="rounded-full"
              />
              <div>
                <p className="font-semibold">Emily Rodriguez</p>
                <p className="text-sm text-muted-foreground">CISO, FinanceFlow</p>
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  </section>
  )}