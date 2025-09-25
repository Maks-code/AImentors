// Файл: frontend/components/AuthForm.tsx
// Компонент формы входа и регистрации пользователя.
// Работает с backend через /login и /register.


"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface AuthFormProps {
  mode: "login" | "register"
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [nickname, setNickname] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setError("")
    setSuccess("")
    setPassword("")
    setConfirmPassword("")
    setNickname("")
  }, [mode])

  const validatePassword = (value: string) => {
    if (value.length < 8) {
      return "Пароль должен быть не короче 8 символов";
    }
    if (!/[A-ZА-Я]/.test(value)) {
      return "Добавьте хотя бы одну заглавную букву";
    }
    if (!/[a-zа-я]/.test(value)) {
      return "Добавьте хотя бы одну строчную букву";
    }
    if (!/[0-9]/.test(value)) {
      return "Добавьте хотя бы одну цифру";
    }
    return "";
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (mode === "register" && password !== confirmPassword) {
      setError("Пароли не совпадают")
      return
    }

    if (mode === "register") {
      const passwordError = validatePassword(password)
      if (passwordError) {
        setError(passwordError)
        return
      }
      if (!nickname.trim()) {
        setError("Введите никнейм")
        return
      }
    }

    setLoading(true)

    try {
      const payload =
        mode === "register"
          ? { email, password, full_name: nickname.trim() }
          : { email, password }

      const res = await fetch(`http://localhost:8000/auth/${mode}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        if (mode === "login") {
          if (res.status === 401) {
            setError("Введён неверный email или пароль")
            return
          }
          if (res.status === 403) {
            setError("Подтвердите электронную почту, чтобы войти")
            return
          }
        } else {
          setError(typeof data.detail === "string" ? data.detail : "Не удалось зарегистрироваться")
          return
        }

        setError(typeof data.detail === "string" ? data.detail : "Произошла ошибка")
        return
      }

      if (mode === "login") {
        if (data?.access_token) {
          localStorage.setItem("access_token", data.access_token)
          router.push("/dashboard")
        } else {
          setError("Не удалось получить токен авторизации")
        }
        return
      }

      setSuccess("Регистрация прошла успешно! Подтвердите почту перед входом.")
      setEmail("")
      setPassword("")
      setConfirmPassword("")
      setNickname("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Неизвестная ошибка")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {mode === "register" && (
        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
            Никнейм
          </label>
          <input
            type="text"
            placeholder="Например, AIVY_hero"
            className="w-full rounded-xl border border-slate-200 bg-white/85 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-200"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            required
          />
        </div>
      )}
      <input
        type="email"
        placeholder="Email"
        className="w-full rounded-xl border border-slate-200 bg-white/85 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-200"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Пароль"
        className="w-full rounded-xl border border-slate-200 bg-white/85 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-200"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      {mode === "register" && (
        <input
          type="password"
          placeholder="Подтвердите пароль"
          className="w-full rounded-xl border border-slate-200 bg-white/85 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-200"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
      )}
      {error && <p className="text-sm text-rose-500">{error}</p>}
      {success && <p className="text-sm text-emerald-600">{success}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-gradient-to-r from-sky-300 via-indigo-300 to-violet-300 px-4 py-2 text-sm font-semibold text-slate-900 shadow-lg shadow-sky-100/70 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Загрузка..." : mode === "login" ? "Войти" : "Зарегистрироваться"}
      </button>
    </form>
  )
}
