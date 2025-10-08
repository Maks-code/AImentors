"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { subscriptionPlans } from "@/lib/subscription-plans";

const floatTransition = {
  duration: 18,
  repeat: Infinity,
  repeatType: "reverse" as const,
  ease: "easeInOut",
};

export default function SubscriptionsPage() {
  const plans = subscriptionPlans;

  return (
    <main className="relative min-h-[calc(100vh-220px)] overflow-hidden bg-[radial-gradient(circle_at_20%_20%,rgba(125,211,252,0.25),transparent_55%),radial-gradient(circle_at_80%_0%,rgba(196,181,253,0.3),transparent_45%),linear-gradient(120deg,#f5f9ff,#f6f1ff,#fdf7ff)] px-4 py-12 text-slate-900 transition-colors duration-500 sm:px-8 md:py-16 dark:bg-[radial-gradient(circle_at_15%_25%,rgba(30,64,175,0.28),transparent_55%),radial-gradient(circle_at_85%_15%,rgba(14,165,233,0.22),transparent_45%),linear-gradient(120deg,#030712,#0f172a,#111827)] dark:text-slate-100">
      <motion.div
        className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-sky-200/40 blur-3xl transition-colors dark:bg-slate-700/40"
        animate={{ x: [0, 40, -20], y: [0, 30, -10] }}
        transition={floatTransition}
      />
      <motion.div
        className="absolute bottom-[-15%] right-[10%] h-96 w-96 rounded-full bg-indigo-200/40 blur-3xl transition-colors dark:bg-indigo-900/40"
        animate={{ x: [0, -30, 30], y: [0, -30, 20] }}
        transition={{ ...floatTransition, duration: 22 }}
      />
      <motion.div
        className="absolute top-[35%] left-[55%] h-72 w-72 rounded-full bg-violet-200/35 blur-3xl transition-colors dark:bg-violet-900/30"
        animate={{ x: [0, 25, -25], y: [0, 20, -15] }}
        transition={{ ...floatTransition, duration: 20 }}
      />

      <div className="relative mx-auto max-w-5xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-slate-500 transition-colors dark:bg-slate-900/60 dark:text-slate-400">
          Подписки
        </span>
        <h1 className="mt-4 text-3xl font-semibold text-slate-900 transition-colors sm:text-4xl md:text-5xl dark:text-slate-100">
          Выберите ритм, с которым вы будете расти
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm text-slate-500 transition-colors sm:text-base dark:text-slate-400">
          Планы отличаются глубиной поддержки и количеством активных учебных треков. Тариф можно поменять в любой момент, не теряя прогресс.
        </p>
      </div>

      <div className="relative mx-auto mt-12 grid max-w-6xl auto-rows-fr gap-6 lg:grid-cols-4">
        {plans.map((plan) => (
          <div key={plan.id} className="relative group">
            <div
              className={cn(
                "relative flex h-full flex-col overflow-hidden rounded-3xl border bg-white/80 p-6 shadow-xl backdrop-blur-xl transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-2xl",
                plan.border,
                plan.glow,
                plan.featured ? "lg:scale-105" : "",
                "dark:border-slate-800/60 dark:bg-slate-900/70 dark:shadow-slate-950/60",
              )}
            >
              {plan.featured && (
                <>
                  <span className="absolute inset-0 rounded-3xl border border-transparent transition duration-300 hover:border-violet-300" />
                  <span className="absolute right-6 top-4 z-20 rounded-full bg-gradient-to-r from-indigo-400 to-violet-400 px-3 py-1 text-xs font-semibold text-white shadow-lg shadow-indigo-200/60">
                    Популярный выбор
                  </span>
                </>
              )}
              <div
                className={cn(
                  "absolute -top-24 right-[-20%] h-48 w-48 rounded-full opacity-60 blur-3xl transition duration-300 group-hover:opacity-90",
                  plan.accent,
                  "dark:bg-slate-800/60",
                )}
              />

              <div className={`relative space-y-3 ${plan.featured ? "pt-10" : "pt-6"}`}>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400 transition-colors dark:text-slate-500">{plan.name}</p>
                <h2 className="text-2xl font-semibold text-slate-900 transition-colors dark:text-slate-100">{plan.tagline}</h2>
                <div className="flex items-baseline gap-1 text-slate-900 transition-colors dark:text-slate-100">
                  <span className="text-4xl font-semibold">{plan.price}</span>
                  <span className="text-sm text-slate-400 transition-colors dark:text-slate-500">{plan.period}</span>
                </div>
              </div>

              <div className="relative mt-6 flex flex-1 flex-col text-sm text-slate-600 transition-colors dark:text-slate-300">
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-3 rounded-2xl border border-white/70 bg-white/70 px-4 py-3 shadow-inner shadow-white transition-colors dark:border-slate-700/60 dark:bg-slate-800/60 dark:shadow-slate-950/40"
                    >
                      <span className="mt-0.5 inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-slate-900/90 text-white transition-colors dark:bg-slate-700 dark:text-slate-100">
                        <Check className="h-4 w-4" />
                      </span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  className={cn(
                    "relative mt-auto inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-semibold transition-all",
                    plan.featured
                      ? "bg-gradient-to-r from-indigo-400 via-violet-400 to-sky-300 text-slate-900 shadow-lg shadow-indigo-200/60 hover:-translate-y-0.5 dark:from-indigo-500 dark:via-violet-500 dark:to-slate-400 dark:text-slate-100 dark:shadow-slate-950/60"
                      : "border border-slate-200 bg-white/80 text-slate-600 dark:text-slate-300 shadow-sm hover:-translate-y-0.5 dark:border-slate-700/60 dark:bg-slate-800/70 dark:text-slate-200 dark:shadow-slate-950/50 dark:hover:bg-slate-700",
                  )}
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
