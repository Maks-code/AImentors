import Link from "next/link"
import { Check } from "lucide-react"

import { subscriptionPlans } from "@/lib/subscription-plans"
import { cn } from "@/lib/utils"

export function SubscriptionsShowcase() {
  return (
    <section
      id="pricing"
      className="relative overflow-hidden bg-[radial-gradient(circle_at_15%_15%,rgba(148,163,184,0.18),transparent_55%),radial-gradient(circle_at_85%_10%,rgba(129,140,248,0.2),transparent_45%),linear-gradient(120deg,#f8fafc,#f1f5f9,#f8fafc)] py-20 text-slate-900"
    >
      <div className="absolute -top-24 left-[10%] h-72 w-72 rounded-full bg-sky-100/60 blur-3xl" />
      <div className="absolute bottom-[-20%] right-[8%] h-80 w-80 rounded-full bg-indigo-100/60 blur-3xl" />
      <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">
          Подписки
        </span>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
          Тарифы как в личном кабинете
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm text-slate-500 sm:text-base">
          Выберите уровень взаимодействия с наставниками и количество параллельных планов. Любой тариф можно сменить в один клик — прогресс сохранится.
        </p>
      </div>

      <div className="relative mx-auto mt-12 grid max-w-6xl auto-rows-fr gap-6 px-4 sm:px-6 lg:px-8 lg:grid-cols-4">
        {subscriptionPlans.map((plan) => (
          <article key={plan.id} className="group relative">
            <div
              className={cn(
                "relative flex h-full flex-col overflow-hidden rounded-3xl border bg-white/85 p-6 shadow-xl shadow-slate-200/70 backdrop-blur-xl transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-2xl",
                plan.border,
                plan.glow,
              )}
            >
              {plan.featured && (
                <span className="absolute right-6 top-4 rounded-full bg-gradient-to-r from-indigo-400 to-violet-400 px-3 py-1 text-xs font-semibold text-white shadow-lg shadow-indigo-200/60">
                  Популярный выбор
                </span>
              )}

              <div
                className={cn(
                  "pointer-events-none absolute -top-24 right-[-15%] h-48 w-48 rounded-full opacity-60 blur-3xl transition group-hover:opacity-90",
                  plan.accent,
                )}
              />

              <div className={cn("relative space-y-3", plan.featured ? "pt-10" : "pt-6")}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">{plan.name}</p>
                <h3 className="text-2xl font-semibold text-slate-900">{plan.tagline}</h3>
                <div className="flex items-baseline gap-1 text-slate-900">
                  <span className="text-4xl font-semibold">{plan.price}</span>
                  <span className="text-sm text-slate-400">{plan.period}</span>
                </div>
              </div>

              <div className="relative mt-6 flex flex-1 flex-col text-sm text-slate-600">
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-3 rounded-2xl border border-white/70 bg-white/70 px-4 py-3 shadow-inner shadow-white"
                    >
                      <span className="mt-0.5 inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-slate-900/90 text-white">
                        <Check className="h-4 w-4" />
                      </span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/dashboard/subscriptions"
                  className={cn(
                    "relative mt-auto inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-semibold transition-all",
                    plan.featured
                      ? "bg-gradient-to-r from-indigo-400 via-violet-400 to-sky-300 text-slate-900 shadow-lg shadow-indigo-200/60 hover:-translate-y-0.5"
                      : "border border-slate-200 bg-white/80 text-slate-600 shadow-sm hover:-translate-y-0.5",
                  )}
                >
                  Смотреть в кабинете
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
