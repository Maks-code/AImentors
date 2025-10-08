"use client"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Zap, Shield, Users, BarChart3 } from "lucide-react"



export function FeaturesSection() {
  return (
    <section id="features" className="py-20 md:py-32">
      <div className="container px-4 md:px-6">
        <div className="mb-16 space-y-4 text-center">
          <Badge variant="outline" className="mx-auto w-fit">
            Возможности
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Всё, что нужно для роста с наставником
          </h2>
          <p className="mx-auto max-w-[800px] text-xl text-muted-foreground">
            AI Mentors объединяет планы, прогресс и поддержку экспертов, чтобы вы двигались вперёд уверенно.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-0 shadow-lg transition-shadow hover:shadow-xl">
            <CardHeader>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                <Zap className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>AI-планы развития</CardTitle>
              <CardDescription>
                Настроенные под ваши цели треки обучения с автоматическими рекомендациями и обновлениями.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg transition-shadow hover:shadow-xl">
            <CardHeader>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>Защищённый доступ</CardTitle>
              <CardDescription>
                Шифрование данных, многофакторная авторизация и контроль доступа на уровне корпоративных решений.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg transition-shadow hover:shadow-xl">
            <CardHeader>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle>Наставники 24/7</CardTitle>
              <CardDescription>
                Общайтесь с AI и живыми экспертами, задавайте вопросы и получайте обратную связь в любом формате.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg transition-shadow hover:shadow-xl">
            <CardHeader>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
                <BarChart3 className="h-6 w-6 text-orange-600" />
              </div>
              <CardTitle>Прозрачная аналитика</CardTitle>
              <CardDescription>
                Отслеживайте прогресс по задачам, планам и консультациям, чтобы видеть реальный результат обучения.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </section>
  )
}
