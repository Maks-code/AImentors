"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardFooter, CardDescription } from "@/components/ui/card"
import { Star } from "lucide-react"
import Image from "next/image"

const testimonials = [
  {
    quote:
      "За первый месяц команда закрыла больше задач, чем за прошлый квартал. Наставники помогают сфокусироваться, а AI подсказывает, что делать дальше.",
    name: "Ксения Полякова",
    role: "Руководитель продукта, SkillPoint",
    avatar: "/placeholder-avatar.png",
  },
  {
    quote:
      "Мне нравится видеть прогресс по планам и модулям. Понимаю, где пробелы, и могу сразу запросить сессию с экспертом — это экономит часы поиска информации.",
    name: "Андрей Литвин",
    role: "Ведущий разработчик, CL Labs",
    avatar: "/placeholder-avatar.png",
  },
  {
    quote:
      "Мы используем AI Mentors для адаптации джуниоров. Платформа обеспечивает структурированное обучение и прозрачную отчётность по результатам.",
    name: "Мария Коваль",
    role: "HR бизнес-партнёр, NeoTech",
    avatar: "/placeholder-avatar.png",
  },
]

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="bg-slate-50 py-20 md:py-32">
      <div className="container px-4 md:px-6">
        <div className="mb-16 space-y-4 text-center">
          <Badge variant="outline" className="mx-auto w-fit">
            Отзывы
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Нас выбирают специалисты и команды
          </h2>
          <p className="mx-auto max-w-[800px] text-xl text-muted-foreground">
            Рассказываем, как AI Mentors помогает выстроить системное обучение без потери темпа.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.name} className="border-0 shadow-lg">
              <CardHeader>
                <div className="mb-4 flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={`${testimonial.name}-${i}`} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <CardDescription className="text-base text-slate-600">
                  “{testimonial.quote}”
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <div className="flex items-center space-x-3">
                  <Image
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    width={40}
                    height={40}
                    className="rounded-full border border-slate-200"
                  />
                  <div>
                    <p className="font-semibold text-slate-900">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
