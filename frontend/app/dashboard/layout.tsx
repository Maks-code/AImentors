"use client"

import { ReactNode } from "react"
import Link from "next/link"
import Image from "next/image"

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow p-4 flex justify-between items-center">
      <Link href="/dashboard" className="flex items-center gap-2 no-underline">
      <video
  src="/Animation_Logo.mp4" // положи в public/
  autoPlay
  loop
  muted
  playsInline
  width={64} // или нужный размер
  height={64}
  style={{ borderRadius: "9999px" }} // если нужно скругление
/>
        <span className="text-2xl font-bold text-black">AIVY</span>
      </Link>
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