// Файл: frontend/app/auth/page.tsx
// Страница авторизации и регистрации.
// Показывает форму и с логином и с регистрацией.


"use client"

import { useState } from "react"
import { AuthForm } from "@/components/AuthForm"

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login")

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-bold mb-4">Вход</h2>
          <AuthForm mode="login" />
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-4">Регистрация</h2>
          <AuthForm mode="register" />
        </div>
      </div>
    </main>
  )
}