"use client"

import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Compass, MessageCircle, Sparkles } from "lucide-react"

const steps = [
  {
    icon: Sparkles,
    title: "Опишите цель",
    description:
      "Расскажите о желаемой должности или навыке — AI Mentors подберёт оптимальный сценарий развития.",
  },
  {
    icon: Compass,
    title: "Получите план",
    description:
      "Готовый маршрут с задачами, материалами и контрольными точками появляется сразу после онбординга.",
  },
  {
    icon: MessageCircle,
    title: "Общайтесь с наставником",
    description:
      "Наставники доступны в чате и на созвонах. Они помогут разобраться со сложными темами и проверят домашние задания.",
  },
  {
    icon: CheckCircle2,
    title: "Фиксируйте прогресс",
    description:
      "Система сохраняет выполненные уроки и рекомендации, чтобы вы всегда видели следующую цель.",
  },
]

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20">
      <div className="mx-auto max-w-6xl px-4 text-slate-900 sm:px-6 lg:px-8">
        <div className="text-center">
          <Badge variant="outline" className="mx-auto w-fit">
            Как это работает
          </Badge>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
            Четыре шага до результативного обучения
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-slate-500 sm:text-base">
            Платформа экономит время на организацию процесса обучения и позволяет сфокусироваться на практике.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {steps.map((step) => (
            <div
              key={step.title}
              className="relative flex h-full flex-col gap-4 rounded-3xl border border-white/70 bg-white/85 p-6 shadow-lg shadow-slate-200/60 backdrop-blur-xl"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100/80 text-sky-600">
                <step.icon className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-slate-900">{step.title}</h3>
                <p className="text-sm text-slate-600">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
