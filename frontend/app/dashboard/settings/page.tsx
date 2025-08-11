// Файл: app/(dashboard)/settings/page.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function SettingsPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState("Maxim Lushkin")
  const [email, setEmail] = useState("example@mail.com")
  const [bio, setBio] = useState("Учусь, развиваюсь, создаю!")

  const [oldPass, setOldPass] = useState("")
  const [newPass, setNewPass] = useState("")

  const handlePasswordChange = async () => {
    const token = localStorage.getItem("access_token")
    if (!token) return alert("Вы не авторизованы")

    try {
      const res = await fetch("http://localhost:8000/auth/me/password", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          old_password: oldPass,
          new_password: newPass
        })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.detail)

      alert("Пароль успешно обновлён")
      localStorage.removeItem("access_token")
      router.push("/auth")
    } catch (err) {
      alert("Ошибка при смене пароля")
      console.error(err)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-10">
      {/* 🔧 Настройки профиля */}
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Настройки профиля</h1>

        <div>
          <label className="block text-sm font-medium mb-1">Имя</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">О себе</label>
          <textarea
            className="w-full border rounded px-3 py-2"
            value={bio}
            rows={4}
            onChange={(e) => setBio(e.target.value)}
          />
        </div>

        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
          Сохранить изменения
        </button>
      </div>

      {/* 🔒 Смена пароля */}
      <div className="max-w-md mx-auto mt-8 p-6 border rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Сменить пароль</h2>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Старый пароль</label>
          <input
            type="password"
            value={oldPass}
            onChange={(e) => setOldPass(e.target.value)}
            autoComplete="off"
            className="w-full border px-3 py-2 rounded"
            placeholder="Введите старый пароль"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Новый пароль</label>
          <input
            type="password"
            value={newPass}
            onChange={(e) => setNewPass(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            placeholder="Введите новый пароль"
          />
        </div>

        <button
          onClick={handlePasswordChange}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Сменить пароль
        </button>
      </div>
    </div>
  )
}