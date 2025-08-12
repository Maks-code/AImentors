"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Zap, Menu } from "lucide-react"
import { isAuthenticated, logout } from "@/lib/auth"
import { useEffect, useState } from "react"

export function Navbar() {
  const [authenticated, setAuthenticated] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("token")) {
      setAuthenticated(true)
    }
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold">StreamLine</span>
        </div>

        <nav className="hidden md:flex items-center space-x-8">
          <Link href="#features" className="text-sm font-medium hover:text-blue-600 transition-colors">
            Features
          </Link>
          <Link href="#testimonials" className="text-sm font-medium hover:text-blue-600 transition-colors">
            Testimonials
          </Link>
          <Link href="#pricing" className="text-sm font-medium hover:text-blue-600 transition-colors">
            Pricing
          </Link>
          <Link href="#contact" className="text-sm font-medium hover:text-blue-600 transition-colors">
            Contact
          </Link>
          
          {/* Добавление ссылки на раздел чатов */}
          <Link href="/dashboard/chats" className="text-sm font-medium hover:text-blue-600 transition-colors">
            Чаты
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          {authenticated ? (
            <>
              <Button variant="ghost" onClick={logout}>
                Выйти
              </Button>
              <img
                src="/placeholder-avatar.png"
                alt="Avatar"
                className="w-8 h-8 rounded-full border"
              />
            </>
          ) : (
            <>
              <Button variant="ghost" className="hidden md:inline-flex">
                <Link href="/auth">Sign In</Link>
              </Button>
              <Button>
                <Link href="/auth">Get Started</Link>
              </Button>
            </>
          )}
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}