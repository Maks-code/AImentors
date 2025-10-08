"use client";

import { useRouter } from "next/navigation";
import {
  MessageCircle,
  UserCircle,
  Users,
  Calendar,
  Settings,
  Star,
} from "lucide-react";

interface QuickAction {
  icon: typeof MessageCircle;
  label: string;
  description: string;
  href: string;
}

const quickActions: QuickAction[] = [
  {
    icon: MessageCircle,
    label: "Чаты",
    description: "Обсудите задачи с наставником и запросите новый план",
    href: "/dashboard/chats",
  },
  {
    icon: UserCircle,
    label: "Профиль",
    description: "Обновите данные аккаунта и настройте уведомления",
    href: "/dashboard/profile",
  },
  {
    icon: Users,
    label: "Менторы",
    description: "Выберите эксперта под цели и опыт",
    href: "/dashboard/mentors",
  },
  {
    icon: Calendar,
    label: "Обучение",
    description: "Продолжите работу над подтверждёнными планами",
    href: "/dashboard/learning",
  },
  {
    icon: Settings,
    label: "Настройки",
    description: "Персонализируйте приложение под свои привычки",
    href: "/dashboard/settings",
  },
];

export default function DashboardHome() {
  const router = useRouter();

  return (
    <div className="space-y-10 text-slate-900 transition-colors duration-500 dark:text-slate-100">
      <section className="relative overflow-hidden rounded-3xl border border-white/60 bg-white/70 p-6 shadow-xl shadow-slate-200/60 backdrop-blur-xl transition-colors duration-500 sm:p-10 dark:border-slate-800/60 dark:bg-slate-900/70 dark:shadow-slate-950/50">
        <div className="absolute -top-16 right-10 h-44 w-44 rounded-full bg-sky-200/40 blur-3xl transition-colors duration-500 dark:bg-slate-700/40" />
        <div className="absolute -bottom-20 left-0 h-64 w-64 rounded-full bg-indigo-200/35 blur-3xl transition-colors duration-500 dark:bg-indigo-900/40" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-5">
            <span className="inline-flex items-center gap-2 rounded-full bg-sky-100/90 px-3 py-1 text-xs font-medium text-sky-700 transition-colors dark:bg-slate-800/60 dark:text-slate-200">
              <span className="inline-block h-2 w-2 rounded-full bg-sky-500 transition-colors dark:bg-slate-400" />
              Добро пожаловать
            </span>
            <div className="space-y-4">
              <h1 className="text-3xl font-semibold text-slate-900 transition-colors sm:text-4xl dark:text-slate-100">
                Управляйте обучением, общайтесь с наставниками и отмечайте прогресс
              </h1>
              <p className="max-w-2xl text-base text-slate-500 transition-colors dark:text-slate-400">
                На этой панели вы видите все ключевые разделы. Здесь легко продолжить план, написать наставнику или обновить профиль. Начните с того, что важно сейчас.
              </p>
            </div>
          </div>
          <div className="group relative w-full max-w-sm overflow-hidden rounded-3xl bg-gradient-to-br from-sky-200/80 to-indigo-200/80 p-6 text-slate-900 shadow-xl shadow-sky-100/70 transition-colors duration-500 dark:from-slate-800/80 dark:to-slate-900/80 dark:text-slate-100 dark:shadow-slate-950/50">
            <div className="absolute -top-4 left-8 h-24 w-24 rounded-full bg-white/60 blur-3xl transition-transform duration-300 group-hover:translate-y-3 dark:bg-slate-900/50" />
            <div className="absolute -bottom-12 right-6 h-28 w-28 rounded-full bg-white/50 blur-3xl transition-transform duration-300 group-hover:-translate-y-2 dark:bg-slate-900/40" />
            <div className="relative space-y-4">
              <p className="text-xs uppercase tracking-[0.4em] text-slate-600/80 transition-colors dark:text-slate-300/80">Следующий шаг</p>
              <h2 className="text-2xl font-semibold">Загляните в раздел обучения</h2>
              <p className="text-sm text-slate-600 transition-colors dark:text-slate-300">
                Проверяйте актуальные уроки, отмечайте выполненные задания и завершайте планы.
              </p>
              <button
                onClick={() => router.push("/dashboard/learning")}
                className="inline-flex items-center justify-center rounded-full bg-white/90 px-5 py-2 text-sm font-semibold text-slate-800 dark:text-slate-200 shadow-md shadow-slate-200 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white dark:bg-slate-800 dark:text-slate-100 dark:shadow-slate-950/60 dark:hover:bg-slate-700"
              >
                Перейти к обучению
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {quickActions.map(({ icon: Icon, label, description, href }) => (
          <button
            key={label}
            onClick={() => router.push(href)}
            className="group relative flex h-full flex-col gap-3 overflow-hidden rounded-2xl border border-white/60 bg-white/70 p-5 text-left shadow-lg shadow-slate-200/70 transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl hover:shadow-sky-100/70 dark:border-slate-800/60 dark:bg-slate-900/70 dark:shadow-slate-950/50 dark:hover:shadow-slate-950/60"
          >
            <span className="absolute inset-0 bg-gradient-to-br from-white/60 via-white/0 to-white/0 opacity-0 transition-opacity duration-200 group-hover:opacity-100 dark:from-slate-900/40" />
            <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-600 shadow-inner shadow-white transition-colors dark:bg-slate-800/70 dark:text-slate-100 dark:shadow-slate-900/60">
              <Icon className="h-5 w-5" />
            </span>
            <div className="relative space-y-1">
              <p className="text-base font-semibold text-slate-900 transition-colors dark:text-slate-100">{label}</p>
              <p className="text-xs text-slate-500 transition-colors dark:text-slate-400">{description}</p>
            </div>
          </button>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="relative overflow-hidden rounded-3xl border border-white/60 bg-white/70 p-6 shadow-xl shadow-slate-200/70 backdrop-blur-xl transition-colors duration-500 sm:p-8 dark:border-slate-800/60 dark:bg-slate-900/70 dark:shadow-slate-950/50">
          <div className="absolute -top-20 right-4 h-36 w-36 rounded-full bg-sky-100 blur-3xl transition-colors duration-500 dark:bg-slate-800/50" />
          <div className="relative space-y-4">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-sky-400 transition-colors dark:bg-slate-400" />
              <span className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-500 transition-colors dark:text-slate-300">Прогресс</span>
            </div>
            <h3 className="text-2xl font-semibold text-slate-900 transition-colors dark:text-slate-100">Прогресс обучения</h3>
            <p className="text-sm text-slate-500 transition-colors dark:text-slate-400">
              Как только вы начнёте отмечать уроки, здесь появится наглядная статистика. Возвращайтесь чаще, чтобы видеть результаты.
            </p>
            <div className="mt-6 h-32 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 transition-colors dark:border-slate-700/60 dark:bg-slate-800/40" />
          </div>
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-white/60 bg-white/70 p-6 shadow-xl shadow-slate-200/70 backdrop-blur-xl transition-colors duration-500 sm:p-8 dark:border-slate-800/60 dark:bg-slate-900/70 dark:shadow-slate-950/50">
          <div className="absolute -bottom-16 left-8 h-40 w-40 rounded-full bg-violet-100 blur-3xl transition-colors duration-500 dark:bg-violet-900/40" />
          <div className="relative space-y-4">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-violet-400 transition-colors dark:bg-violet-300" />
              <span className="text-xs font-semibold uppercase tracking-[0.35em] text-violet-500 transition-colors dark:text-violet-300">Достижения</span>
            </div>
            <h3 className="text-2xl font-semibold text-slate-900 transition-colors dark:text-slate-100">Ваши трофеи</h3>
            <p className="text-sm text-slate-500 transition-colors dark:text-slate-400">
              Получайте значки за завершённые планы и активность. Награды помогут отслеживать путь развития.
            </p>
            <div className="flex gap-3 pt-2 text-violet-400 transition-colors dark:text-violet-300">
              <Star className="h-8 w-8" />
              <Star className="h-8 w-8" />
              <Star className="h-8 w-8 opacity-40" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
