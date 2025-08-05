"use client"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardDescription} from "@/components/ui/card"
import { Zap, Shield, Users, BarChart3 } from "lucide-react"



export function FeaturesSection() {
  return (
    <section id="features" className="py-20 md:py-32">
    <div className="container px-4 md:px-6">
      <div className="text-center space-y-4 mb-16">
        <Badge variant="outline" className="w-fit mx-auto">
          Features
        </Badge>
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
          Everything you need to succeed
        </h2>
        <p className="text-xl text-muted-foreground max-w-[800px] mx-auto">
          Powerful features designed to transform how your team works together
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
              <Zap className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle>Smart Automation</CardTitle>
            <CardDescription>
              AI-powered workflows that learn from your patterns and automate repetitive tasks
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle>Enterprise Security</CardTitle>
            <CardDescription>
              Bank-level encryption and compliance with SOC 2, GDPR, and HIPAA standards
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <CardTitle>Team Collaboration</CardTitle>
            <CardDescription>
              Real-time collaboration tools with advanced permission controls and audit logs
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <div className="h-12 w-12 rounded-lg bg-orange-100 flex items-center justify-center mb-4">
              <BarChart3 className="h-6 w-6 text-orange-600" />
            </div>
            <CardTitle>Advanced Analytics</CardTitle>
            <CardDescription>
              Comprehensive insights and reporting to track performance and optimize workflows
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  </section>

  )
}