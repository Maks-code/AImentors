"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

const plans = [
  {
    id: "free",
    name: "Free",
    tagline: "Попробуйте платформу без обязательств",
    price: "0₽",
    period: "в месяц",
    accent: "bg-slate-200",
    border: "border-slate-200",
    glow: "shadow-slate-200/70",
    features: [
      "Ограниченный набор менторов",
      "1 активный учебный план",
      "Базовый доступ к материалам",
      "Поддержка по e-mail",
    ],
  },
  {
    id: "starter",
    name: "Стартовый",
    tagline: "Первые шаги под руководством наставников",
    price: "1 490₽",
    period: "в месяц",
    accent: "bg-sky-200",
    border: "border-sky-200",
    glow: "shadow-sky-200/70",
    features: [
      "Расширенный набор менторов",
      "До 3 активных учебных планов",
      "Прогресс и отметки в реальном времени",
      "Приоритетные ответы наставников",
    ],
  },
  {
    id: "pro",
    name: "Продвинутый",
    tagline: "Оптимальное сочетание гибкости и поддержки",
    price: "3 490₽",
    period: "в месяц",
    accent: "bg-indigo-200",
    border: "border-indigo-200",
    glow: "shadow-indigo-200/70",
    featured: true,
    features: [
      "Доступ ко всем доступным менторам",
      "До 7 активных учебных планов",
      "Планирование с наставником в календаре",
      "Расширенная аналитика прогресса",
      "Приоритетная поддержка 12/7",
    ],
  },
  {
    id: "expert",
    name: "Эксперт",
    tagline: "Для тех, кто создаёт собственный путь",
    price: "6 990₽",
    period: "в месяц",
    accent: "bg-violet-200",
    border: "border-violet-200",
    glow: "shadow-violet-200/70",
    features: [
      "Все менторы без ограничений",
      "До 15 активных учебных планов",
      "Конструктор собственных AI-наставников",
      "Совместное планирование в календаре",
      "Личный куратор и поддержка 24/7",
    ],
  },
];

const floatTransition = {
  duration: 18,
  repeat: Infinity,
  repeatType: "reverse" as const,
  ease: "easeInOut",
};

export default function SubscriptionsPage() {
  return (
    <main className="relative min-h-[calc(100vh-220px)] overflow-hidden bg-[radial-gradient(circle_at_20%_20%,rgba(125,211,252,0.25),transparent_55%),radial-gradient(circle_at_80%_0%,rgba(196,181,253,0.3),transparent_45%),linear-gradient(120deg,#f5f9ff,#f6f1ff,#fdf7ff)] px-4 py-12 sm:px-8 md:py-16">
      <motion.div
        className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-sky-200/40 blur-3xl"
        animate={{ x: [0, 40, -20], y: [0, 30, -10] }}
        transition={floatTransition}
      />
      <motion.div
        className="absolute bottom-[-15%] right-[10%] h-96 w-96 rounded-full bg-indigo-200/40 blur-3xl"
        animate={{ x: [0, -30, 30], y: [0, -30, 20] }}
        transition={{ ...floatTransition, duration: 22 }}
      />
      <motion.div
        className="absolute top-[35%] left-[55%] h-72 w-72 rounded-full bg-violet-200/35 blur-3xl"
        animate={{ x: [0, 25, -25], y: [0, 20, -15] }}
        transition={{ ...floatTransition, duration: 20 }}
      />

      <div className="relative mx-auto max-w-5xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">
          Подписки
        </span>
        <h1 className="mt-4 text-3xl font-semibold text-slate-900 sm:text-4xl md:text-5xl">
          Выберите ритм, с которым вы будете расти
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm text-slate-500 sm:text-base">
          Планы отличаются глубиной поддержки и количеством активных учебных треков. Тариф можно поменять в любой момент, не теряя прогресс.
        </p>
      </div>

      <div className="relative mx-auto mt-12 grid max-w-6xl auto-rows-fr gap-6 lg:grid-cols-4">
        {plans.map((plan) => (
          <div key={plan.id} className="relative">
            <div
              className={`relative flex h-full flex-col overflow-hidden rounded-3xl border ${plan.border} bg-white/80 p-6 shadow-xl ${plan.glow} backdrop-blur-xl transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-2xl ${
                plan.featured ? "lg:scale-105" : ""
              }`}
            >
              {plan.featured && (
                <>
                  <span className="absolute inset-0 rounded-3xl border border-transparent transition duration-300 hover:border-violet-300" />
                  <span className="absolute right-6 top-4 z-20 rounded-full bg-gradient-to-r from-indigo-400 to-violet-400 px-3 py-1 text-xs font-semibold text-white shadow-lg shadow-indigo-200/60">
                    Популярный выбор
                  </span>
                </>
              )}
              <div className={`absolute -top-24 right-[-20%] h-48 w-48 rounded-full ${plan.accent} opacity-60 blur-3xl transition duration-300 group-hover:opacity-90`} />

              <div className={`relative space-y-3 ${plan.featured ? "pt-10" : "pt-6"}`}>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">{plan.name}</p>
                <h2 className="text-2xl font-semibold text-slate-900">{plan.tagline}</h2>
                <div className="flex items-baseline gap-1 text-slate-900">
                  <span className="text-4xl font-semibold">{plan.price}</span>
                  <span className="text-sm text-slate-400">{plan.period}</span>
                </div>
              </div>

              <div className="relative mt-6 flex flex-1 flex-col text-sm text-slate-600">
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 rounded-2xl border border-white/70 bg-white/70 px-4 py-3 shadow-inner shadow-white">
                      <span className="mt-0.5 inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-slate-900/90 text-white">
                        <Check className="h-4 w-4" />
                      </span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  className={`relative mt-auto inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-semibold transition-all ${
                    plan.featured
                      ? "bg-gradient-to-r from-indigo-400 via-violet-400 to-sky-300 text-slate-900 shadow-lg shadow-indigo-200/60 hover:-translate-y-0.5"
                      : "border border-slate-200 bg-white/80 text-slate-600 shadow-sm hover:-translate-y-0.5"
                  }`}
                >
                  Выбрать тариф
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
