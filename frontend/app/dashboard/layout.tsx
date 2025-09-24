"use client"

import { ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-rose-50 via-white to-violet-50">
      <header className="sticky top-0 z-50 bg-white/30 backdrop-blur-xl border-b border-white/20 shadow-md p-4 flex justify-between items-center rounded-b-2xl">
        <Link href="/dashboard" className="flex items-center gap-2 no-underline">
          <video
            src="/Animation_Logo.mp4"
            autoPlay
            loop
            muted
            playsInline
            width={64}
            height={64}
            style={{ borderRadius: "9999px" }}
          />
          <span className="text-2xl font-bold text-gray-900">AIVY</span>
        </Link>

        <nav className="space-x-4 flex items-center">
          <Link
            href="/dashboard/profile"
            className={
              pathname === "/dashboard/profile"
                ? "bg-indigo-100 text-indigo-700 px-3 py-2 rounded-lg"
                : "text-gray-700 hover:text-gray-900 hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors"
            }
          >
            Профиль
          </Link>
          <Link
            href="/dashboard/mentors"
            className={
              pathname === "/dashboard/mentors"
                ? "bg-indigo-100 text-indigo-700 px-3 py-2 rounded-lg"
                : "text-gray-700 hover:text-gray-900 hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors"
            }
          >
            Менторы
          </Link>
          <Link
            href="/dashboard/plans"
            className={
              pathname === "/dashboard/plans"
                ? "bg-indigo-100 text-indigo-700 px-3 py-2 rounded-lg"
                : "text-gray-700 hover:text-gray-900 hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors"
            }
          >
            Мои планы
          </Link>
          <Link
            href="/dashboard/chats"
            className={
              pathname === "/dashboard/chats"
                ? "bg-indigo-100 text-indigo-700 px-3 py-2 rounded-lg"
                : "text-gray-700 hover:text-gray-900 hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors"
            }
          >
            Чаты
          </Link>
          <Link
            href="/dashboard/subscriptions"
            className={
              pathname === "/dashboard/subscriptions"
                ? "bg-indigo-100 text-indigo-700 px-3 py-2 rounded-lg"
                : "text-gray-700 hover:text-gray-900 hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors"
            }
          >
            Подписки
          </Link>
          <Link
            href="/dashboard/settings"
            className={
              pathname === "/dashboard/settings"
                ? "bg-indigo-100 text-indigo-700 px-3 py-2 rounded-lg"
                : "text-gray-700 hover:text-gray-900 hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors"
            }
          >
            Настройки
          </Link>

          <button
            onClick={() => {
              localStorage.removeItem("access_token")
              window.location.href = "/auth"
            }}
            className="ml-4 bg-gradient-to-r from-rose-500 to-red-600 text-white px-4 py-2 rounded-lg shadow hover:opacity-90 transition"
          >
            Выйти
          </button>
        </nav>
      </header>

      <main className="flex-1 p-6 flex justify-center">
        <div className="w-full max-w-5xl space-y-6">
          <div className="rounded-2xl bg-white/40 backdrop-blur-lg shadow-xl border border-white/30 p-6">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}