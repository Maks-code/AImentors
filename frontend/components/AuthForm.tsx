// Файл: frontend/components/AuthForm.tsx
// Компонент формы входа и регистрации пользователя.
// Работает с backend через /login и /register.


"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface AuthFormProps {
  mode: "login" | "register"
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (mode === "register" && password !== confirmPassword) {
      setError("Пароли не совпадают")
      return
    }

    setLoading(true)

    try {
      const res = await fetch(`http://localhost:8000/auth/${mode}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (res.ok) {
        localStorage.setItem("access_token", data.access_token)
        router.push("/dashboard")
        return
      }

      if (mode === "register") {
        alert("Регистрация прошла успешно. Подтвердите почту перед входом.")
        setEmail("")
        setPassword("")
        setConfirmPassword("")
      }

      // if (!res.ok) {
      //   throw new Error(data.detail || "Ошибка авторизации")
      // }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="email"
        placeholder="Email"
        className="w-full border rounded p-2"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Пароль"
        className="w-full border rounded p-2"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      {mode === "register" && (
        <input
          type="password"
          placeholder="Подтвердите пароль"
          className="w-full border rounded p-2"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
      )}
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white rounded p-2 hover:bg-blue-700"
      >
        {loading ? "Загрузка..." : mode === "login" ? "Войти" : "Зарегистрироваться"}
      </button>
    </form>
  )
}