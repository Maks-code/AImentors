// Файл: app/(dashboard)/chats/components/Sidebar.tsx
"use client"

import Image from "next/image"
import { useState } from "react"
import { api } from "@/lib/api"

interface Mentor {
  id: string
  name: string
  subject: string
  description: string
  avatar_url?: string
  category: string
}

interface SidebarProps {
  mentors: Mentor[]
  onSelect: (mentorId: string) => void
  onDelete: (mentorId: string) => void // Колбэк для удаления ментора из родительского компонента
}

export default function Sidebar({ mentors, onSelect, onDelete }: SidebarProps) {
  const [activeMentor, setActiveMentor] = useState<string | null>(null)
  const [showConfirmDelete, setShowConfirmDelete] = useState<string | null>(null) // для показа окна подтверждения
  const [deleting, setDeleting] = useState(false) // индикатор загрузки при удалении
  
  const handleSelect = (id: string) => {
    setActiveMentor(id)
    onSelect(id)
    const selectedMentor = mentors.find(mentor => mentor.id === id);
    if (selectedMentor) {
      console.log(selectedMentor.avatar_url); // Выводим значение avatar_url
    }
  }
  
  const handleDelete = async (mentorId: string) => {
    setDeleting(true) // начинаем процесс удаления
    try {
      await api.delete(`/chat/history/${mentorId}`) // отправляем запрос на удаление истории
      onDelete(mentorId) // вызываем колбэк на удаление ментора из списка
      setShowConfirmDelete(null) // скрываем окно подтверждения
      alert("История чатов с этим наставником успешно удалена.") // уведомление
    } catch (error) {
      console.error("Ошибка при удалении истории чатов:", error)
      alert("Не удалось удалить историю чатов с наставником.")
    } finally {
      setDeleting(false) // завершаем процесс удаления
    }
  }
  return (
    <aside className="flex h-full w-full flex-col overflow-hidden rounded-3xl border border-white/60 bg-white/75 p-4 shadow-xl shadow-slate-200/60 backdrop-blur-xl lg:w-[300px]">
      <h2 className="text-lg font-semibold text-slate-900">Мои наставники</h2>
      <p className="mt-1 text-xs text-slate-400">Выбирайте диалог, чтобы продолжить общение</p>

      {mentors.length === 0 && (
        <p className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 p-4 text-center text-sm text-slate-500">
          Нет активных чатов
        </p>
      )}

      <ul className="mt-4 space-y-2 overflow-y-auto pr-1">
        {mentors.map((mentor) => (
          <li key={mentor.id} className="relative">
            <button
              onClick={() => handleSelect(mentor.id)}
              className={`group flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left transition-all ${
                activeMentor === mentor.id
                  ? "border border-sky-200 bg-sky-50 text-sky-700 shadow-md"
                  : "border border-transparent hover:border-slate-200 hover:bg-white"
              }`}
            >
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-100">
                <Image
                  src={mentor.avatar_url ? `/${mentor.avatar_url}` : "/default-avatar.png"}
                  alt={mentor.name || "Аватар наставника"}
                  width={48}
                  height={48}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-800">{mentor.name}</p>
                <p className="text-xs text-slate-400">{mentor.subject}</p>
              </div>
            </button>

            <button
              onClick={() => setShowConfirmDelete(mentor.id)}
              className="absolute top-2 right-2 rounded-full bg-rose-50 px-2 py-1 text-xs text-rose-500 shadow hover:bg-rose-100"
              title="Удалить историю"
              disabled={deleting}
            >
              ✕
            </button>

            {showConfirmDelete === mentor.id && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-sm">
                <div className="w-[320px] space-y-4 rounded-2xl border border-white/60 bg-white/95 p-6 text-slate-600 shadow-2xl">
                  <h3 className="text-lg font-semibold text-slate-900">Удалить историю чата?</h3>
                  <p className="text-sm">
                    Вы уверены, что хотите удалить переписку с наставником <span className="font-semibold">{mentor.name}</span>? Вернуть историю будет невозможно.
                  </p>
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setShowConfirmDelete(null)}
                      className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm hover:-translate-y-0.5"
                    >
                      Отмена
                    </button>
                    <button
                      onClick={() => handleDelete(mentor.id)}
                      className="rounded-full bg-gradient-to-r from-rose-300 to-rose-400 px-4 py-2 text-sm font-semibold text-rose-900 shadow hover:-translate-y-0.5"
                      disabled={deleting}
                    >
                      {deleting ? "Удаляем…" : "Удалить"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </aside>
  )
}
