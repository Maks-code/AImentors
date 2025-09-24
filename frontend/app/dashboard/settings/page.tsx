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

  // Новые состояния для новых секций
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [browserNotifications, setBrowserNotifications] = useState(false)

  const [darkTheme, setDarkTheme] = useState(false)

  const [hideEmail, setHideEmail] = useState(false)
  const [privateProfile, setPrivateProfile] = useState(false)

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

  const handleResetDefaults = () => {
    setFullName("Maxim Lushkin")
    setEmail("example@mail.com")
    setBio("Учусь, развиваюсь, создаю!")
    setOldPass("")
    setNewPass("")
    setEmailNotifications(true)
    setBrowserNotifications(false)
    setDarkTheme(false)
    setHideEmail(false)
    setPrivateProfile(false)
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-10">
      {/* 🔧 Настройки профиля */}
      <div className="p-6 rounded-2xl bg-white/30 backdrop-blur-lg border border-white/40 shadow-xl space-y-4">
        <h1 className="text-2xl font-bold text-indigo-700">Настройки профиля</h1>

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

        <button className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-lg shadow hover:opacity-90 transition">
          Сохранить изменения
        </button>
      </div>

      {/* 🔒 Смена пароля */}
      <div className="p-6 rounded-2xl bg-white/30 backdrop-blur-lg border border-white/40 shadow-xl space-y-4">
        <h2 className="text-xl font-semibold text-indigo-600 mb-4">Сменить пароль</h2>

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
          className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-lg shadow hover:opacity-90 transition"
        >
          Сменить пароль
        </button>
      </div>

      {/* 🔔 Настройки уведомлений */}
      <div className="p-6 rounded-2xl bg-white/30 backdrop-blur-lg border border-white/40 shadow-xl space-y-4">
        <h2 className="text-xl font-semibold text-indigo-600 mb-4">Настройки уведомлений</h2>
        <div className="flex items-center mb-3">
          <input
            id="emailNotifications"
            type="checkbox"
            checked={emailNotifications}
            onChange={() => setEmailNotifications(!emailNotifications)}
            className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="emailNotifications" className="text-sm font-medium">
            Email-уведомления
          </label>
        </div>
        <div className="flex items-center">
          <input
            id="browserNotifications"
            type="checkbox"
            checked={browserNotifications}
            onChange={() => setBrowserNotifications(!browserNotifications)}
            className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="browserNotifications" className="text-sm font-medium">
            Уведомления в браузере
          </label>
        </div>
        <button className="mt-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-lg shadow hover:opacity-90 transition">
          Сохранить уведомления
        </button>
      </div>

      {/* 🎨 Настройки темы */}
      <div className="p-6 rounded-2xl bg-white/30 backdrop-blur-lg border border-white/40 shadow-xl space-y-4">
        <h2 className="text-xl font-semibold text-indigo-600 mb-4">Настройки темы</h2>
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium">Светлая</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={darkTheme}
              onChange={() => setDarkTheme(!darkTheme)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-500 dark:peer-focus:ring-blue-800 peer-checked:bg-blue-600 relative">
              <span
                className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-5`}
              />
            </div>
          </label>
          <span className="text-sm font-medium">Тёмная</span>
        </div>
        <button className="mt-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-lg shadow hover:opacity-90 transition">
          Сохранить тему
        </button>
      </div>

      {/* 🔐 Настройки приватности */}
      <div className="p-6 rounded-2xl bg-white/30 backdrop-blur-lg border border-white/40 shadow-xl space-y-4">
        <h2 className="text-xl font-semibold text-indigo-600 mb-4">Настройки приватности</h2>
        <div className="flex items-center mb-3">
          <input
            id="hideEmail"
            type="checkbox"
            checked={hideEmail}
            onChange={() => setHideEmail(!hideEmail)}
            className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="hideEmail" className="text-sm font-medium">
            Скрывать email от других
          </label>
        </div>
        <div className="flex items-center">
          <input
            id="privateProfile"
            type="checkbox"
            checked={privateProfile}
            onChange={() => setPrivateProfile(!privateProfile)}
            className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="privateProfile" className="text-sm font-medium">
            Делать профиль приватным
          </label>
        </div>
        <button className="mt-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-lg shadow hover:opacity-90 transition">
          Сохранить приватность
        </button>
      </div>

      {/* Кнопка сброса настроек */}
      <div className="flex justify-center">
        <button
          onClick={handleResetDefaults}
          className="bg-gradient-to-r from-rose-500 to-red-600 text-white px-6 py-2 rounded-lg shadow hover:opacity-90 transition"
        >
          Сбросить настройки по умолчанию
        </button>
      </div>
    </div>
  )
}