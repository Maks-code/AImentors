"use client"

import { ReactNode } from "react"
import Link from "next/link"

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow p-4 flex justify-between items-center">
        <Link href="/dashboard" className="text-xl font-bold">streamline</Link>
        <nav className="space-x-4">
          <Link href="/dashboard/profile">Профиль</Link>
          <Link href="/dashboard/mentors">Менторы</Link>
          <Link href="/dashboard/chats">Чаты</Link>
          <Link href="/dashboard/subscriptions">Подписки</Link>
          <Link href="/dashboard/settings">Настройки</Link>
          <button
              onClick={() => {
                localStorage.removeItem("access_token")
                window.location.href = "/auth"
              }}
              className="ml-4 text-sm text-red-600 hover:underline"
            >
              Выйти
        </button>
        </nav>
      </header>

      <main className="flex-1 p-6">{children}</main>
    </div>
  )
}