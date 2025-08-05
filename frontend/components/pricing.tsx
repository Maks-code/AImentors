"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"


interface PricingSectionProps {
  title?: string
  subtitle?: string
  background?: string
  variant?: "default" | "minimal"
}


export function PricingSection({
  title = "Simple, transparent pricing",
  subtitle = "Choose the perfect plan for your team's needs",
  background = "bg-white",
  variant = "default"
}: PricingSectionProps) {
    return (
      <>
      {variant === "default" && (
        <section id="pricing" className="py-20 md:py-32">
          <div className="container px-4 md:px-6">
            <div className="text-center space-y-4 mb-16">
              <Badge variant="outline" className="w-fit mx-auto">
                Pricing
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">{title}</h2>
              <p className="text-xl text-muted-foreground max-w-[800px] mx-auto">
                {subtitle}
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
              <Card className="border-2 hover:border-blue-200 transition-colors">
                <CardHeader>
                  <CardTitle className="text-2xl">Starter</CardTitle>
                  <CardDescription>Perfect for small teams getting started</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">$29</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Check className="h-4 w-4 text-green-600" />
                      <span>Up to 5 team members</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Check className="h-4 w-4 text-green-600" />
                      <span>100 automation runs/month</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Check className="h-4 w-4 text-green-600" />
                      <span>Basic integrations</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Check className="h-4 w-4 text-green-600" />
                      <span>Email support</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full bg-transparent" variant="outline">
                    Start Free Trial
                  </Button>
                </CardFooter>
              </Card>

              <Card className="border-2 border-blue-600 relative hover:border-blue-700 transition-colors">
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600">Most Popular</Badge>
                <CardHeader>
                  <CardTitle className="text-2xl">Professional</CardTitle>
                  <CardDescription>Ideal for growing businesses</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">$99</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Check className="h-4 w-4 text-green-600" />
                      <span>Up to 25 team members</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Check className="h-4 w-4 text-green-600" />
                      <span>1,000 automation runs/month</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Check className="h-4 w-4 text-green-600" />
                      <span>Advanced integrations</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Check className="h-4 w-4 text-green-600" />
                      <span>Priority support</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Check className="h-4 w-4 text-green-600" />
                      <span>Advanced analytics</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">Start Free Trial</Button>
                </CardFooter>
              </Card>

              <Card className="border-2 hover:border-blue-200 transition-colors">
                <CardHeader>
                  <CardTitle className="text-2xl">Enterprise</CardTitle>
                  <CardDescription>For large organizations with custom needs</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">Custom</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Check className="h-4 w-4 text-green-600" />
                      <span>Unlimited team members</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Check className="h-4 w-4 text-green-600" />
                      <span>Unlimited automation runs</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Check className="h-4 w-4 text-green-600" />
                      <span>Custom integrations</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Check className="h-4 w-4 text-green-600" />
                      <span>24/7 dedicated support</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Check className="h-4 w-4 text-green-600" />
                      <span>Custom SLA</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full bg-transparent" variant="outline">
                    Contact Sales
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>
      )}

      {variant === "minimal" && (
        <section className={`py-16 px-4 ${background}`}>
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-3xl font-bold">{title}</h2>
            <p className="text-muted-foreground">{subtitle}</p>
            <div className="mt-8 flex justify-center">
              <Card className="w-full max-w-sm border-2 border-dashed hover:border-blue-300 transition">
                <CardHeader>
                  <CardTitle className="text-xl">Simple Plan</CardTitle>
                  <div className="mt-2">
                    <span className="text-3xl font-bold">$9</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-3">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>Core features included</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">Start Now</Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>
      )}
      </>
    )
  }