"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Menu } from "lucide-react"

import { Button } from "@/components/ui/button"
import { isAuthenticated, logout } from "@/lib/auth"

export function Navbar() {
  const [authenticated, setAuthenticated] = useState(false)

  useEffect(() => {
    setAuthenticated(isAuthenticated())
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/60 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-4 text-slate-900 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
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

        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
          <Link href="#features" className="transition-colors hover:text-slate-900">
            Возможности
          </Link>
          <Link href="#testimonials" className="transition-colors hover:text-slate-900">
            Отзывы
          </Link>
          <Link href="#pricing" className="transition-colors hover:text-slate-900">
            Подписки
          </Link>
          <Link href="#contact" className="transition-colors hover:text-slate-900">
            Контакты
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {authenticated ? (
            <>
              <Button
                asChild
                variant="ghost"
                className="hidden md:inline-flex text-slate-600 hover:text-slate-900"
              >
                <Link href="/dashboard">Мой кабинет</Link>
              </Button>
              <Button
                onClick={() => logout("/auth")}
                className="bg-gradient-to-r from-sky-300 via-indigo-300 to-violet-300 text-slate-900 shadow-lg shadow-sky-100/70 transition-transform hover:-translate-y-0.5"
              >
                Выйти
              </Button>
            </>
          ) : (
            <>
              <Button
                asChild
                variant="ghost"
                className="hidden md:inline-flex text-slate-600 hover:text-slate-900"
              >
                <Link href="/auth?mode=login">Войти</Link>
              </Button>
              <Button
                asChild
                className="bg-gradient-to-r from-sky-300 via-indigo-300 to-violet-300 text-slate-900 shadow-lg shadow-sky-100/70 transition-transform hover:-translate-y-0.5"
              >
                <Link href="/auth?mode=register">Создать аккаунт</Link>
              </Button>
            </>
          )}
          <Button variant="ghost" size="icon" className="md:hidden text-slate-600">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}
