"use client"

import { ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  const navLinkClass = (target: string) =>
    `relative inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
      pathname === target
        ? "text-slate-900 bg-white/80 shadow-lg shadow-sky-100/60"
        : "text-slate-500 hover:text-slate-900 hover:bg-white/70 hover:shadow-md"
    }`

  return (
    <div className="min-h-screen w-full bg-[radial-gradient(circle_at_20%_20%,rgba(125,211,252,0.25),transparent_55%),radial-gradient(circle_at_80%_0%,rgba(196,181,253,0.3),transparent_45%),linear-gradient(120deg,#f8fafc,#f1f5f9)]">
      <div className="mx-auto flex min-h-screen max-w-[1400px] flex-col px-4 pb-10 sm:px-8 lg:px-12">
        <header className="sticky top-4 z-50 mt-6 rounded-3xl border border-white/40 bg-white/70 p-4 shadow-2xl shadow-sky-100/30 backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link href="/dashboard" className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-200 to-indigo-200 shadow-inner shadow-white/60">
                <video
                  src="/Animation_Logo.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="h-8 w-8 object-cover"
                />
              </span>
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-slate-400">AI mentors</p>
                <span className="text-2xl font-semibold tracking-tight text-slate-900">AIVY</span>
              </div>
            </Link>

            <nav className="flex flex-1 flex-wrap items-center justify-end gap-2">
              <Link href="/dashboard/profile" className={navLinkClass("/dashboard/profile")}>
                <span>Профиль</span>
              </Link>
              <Link href="/dashboard/mentors" className={navLinkClass("/dashboard/mentors")}>
                <span>Менторы</span>
              </Link>
              <Link href="/dashboard/learning" className={navLinkClass("/dashboard/learning")}>
                <span>Обучение</span>
              </Link>
              <Link href="/dashboard/chats" className={navLinkClass("/dashboard/chats")}>
                <span>Чаты</span>
              </Link>
              <Link href="/dashboard/subscriptions" className={navLinkClass("/dashboard/subscriptions")}>
                <span>Подписки</span>
              </Link>
              <Link href="/dashboard/settings" className={navLinkClass("/dashboard/settings")}>
                <span>Настройки</span>
              </Link>

              <button
                onClick={() => {
                  localStorage.removeItem("access_token")
                  window.location.href = "/auth"
                }}
                className="group relative ml-2 inline-flex items-center overflow-hidden rounded-full bg-gradient-to-r from-sky-300 via-indigo-300 to-violet-300 px-5 py-2 text-sm font-semibold text-slate-900 shadow-lg shadow-sky-100/60 transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-xl"
              >
                <span className="absolute inset-0 bg-white/30 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                <span className="relative">Выйти</span>
              </button>
            </nav>
          </div>
        </header>

        <main className="flex-1 py-10">
          <div className="relative overflow-hidden rounded-3xl border border-white/50 bg-white/75 shadow-2xl shadow-slate-200/70 backdrop-blur-xl">
            <div className="absolute -top-20 left-10 h-40 w-40 rounded-full bg-sky-200/40 blur-3xl" />
            <div className="absolute -bottom-24 right-10 h-48 w-48 rounded-full bg-indigo-200/40 blur-3xl" />
            <div className="relative p-6 sm:p-10">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
