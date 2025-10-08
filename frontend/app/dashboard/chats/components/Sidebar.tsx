// Файл: app/(dashboard)/chats/components/Sidebar.tsx
"use client"

import Image from "next/image";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export interface SidebarMentor {
  id: string;
  name: string;
  subject: string;
  description: string;
  avatar_url?: string;
  category: string;
  last_interaction?: string | null;
}

interface SidebarProps {
  mentors: SidebarMentor[];
  onSelect: (mentorId: string) => void;
  onDelete: (mentorId: string) => void;
  currentMentorId?: string | null;
}

export default function Sidebar({ mentors, onSelect, onDelete, currentMentorId }: SidebarProps) {
  const [activeMentor, setActiveMentor] = useState<string | null>(null)
  const [showConfirmDelete, setShowConfirmDelete] = useState<string | null>(null) // для показа окна подтверждения
  const [deleting, setDeleting] = useState(false) // индикатор загрузки при удалении
  
  useEffect(() => {
    setActiveMentor(currentMentorId ?? null)
  }, [currentMentorId])
  
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
      if (typeof window !== "undefined") {
        sessionStorage.removeItem(`welcome_sent_${mentorId}`)
      }
      alert("История чатов с этим наставником успешно удалена.") // уведомление
    } catch (error) {
      console.error("Ошибка при удалении истории чатов:", error)
      alert("Не удалось удалить историю чатов с наставником.")
    } finally {
      setDeleting(false) // завершаем процесс удаления
    }
  }
  return (
    <aside className="flex h-full w-full flex-col overflow-hidden rounded-3xl border border-white/60 bg-white/80 p-4 text-slate-900 shadow-xl shadow-slate-200/60 backdrop-blur-xl transition-colors duration-500 lg:w-[320px] dark:border-slate-800/60 dark:bg-slate-900/70 dark:text-slate-100 dark:shadow-slate-950/50">
      <h2 className="text-lg font-semibold text-slate-900 transition-colors dark:text-slate-100">Мои наставники</h2>
      <p className="mt-1 text-xs text-slate-400 transition-colors dark:text-slate-500">Выбирайте диалог, чтобы продолжить общение</p>

      {mentors.length === 0 && (
        <p className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 p-4 text-center text-sm text-slate-500 transition-colors dark:border-slate-700/60 dark:bg-slate-800/40 dark:text-slate-400">
          Нет активных чатов
        </p>
      )}

      <ul className="mt-4 space-y-2 overflow-y-auto pr-2">
        {mentors.map((mentor) => (
          <li key={mentor.id} className="relative">
            <button
              onClick={() => handleSelect(mentor.id)}
              className={`group flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left transition-all ${
                activeMentor === mentor.id
                  ? "border border-sky-200 bg-sky-50 text-sky-700 shadow-md dark:border-sky-500/40 dark:bg-sky-500/10 dark:text-sky-200"
                  : "border border-transparent hover:border-slate-200 hover:bg-white dark:hover:border-slate-700/60 dark:hover:bg-slate-800/50"
              }`}
            >
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-100 transition-colors dark:bg-slate-800/70">
                <Image
                  src={mentor.avatar_url ? `/${mentor.avatar_url}` : "/default-avatar.png"}
                  alt={mentor.name || "Аватар наставника"}
                  width={48}
                  height={48}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-800 transition-colors dark:text-slate-200">{mentor.name}</p>
                <p className="text-xs text-slate-400 transition-colors dark:text-slate-500">{mentor.subject}</p>
              </div>
            </button>

            <button
              onClick={() => setShowConfirmDelete(mentor.id)}
              className="absolute top-2 right-2 rounded-full bg-rose-50 px-2 py-1 text-xs text-rose-500 shadow transition hover:bg-rose-100 dark:bg-rose-500/20 dark:text-rose-200 dark:hover:bg-rose-500/30"
              title="Удалить историю"
              disabled={deleting}
            >
              ✕
            </button>

            {showConfirmDelete === mentor.id && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-sm">
                <div className="w-[320px] space-y-4 rounded-2xl border border-white/60 bg-white/95 p-6 text-slate-600 shadow-2xl transition-colors dark:border-slate-800/60 dark:bg-slate-900/80 dark:text-slate-300 dark:shadow-slate-950/60">
                  <h3 className="text-lg font-semibold text-slate-900 transition-colors dark:text-slate-100">Удалить историю чата?</h3>
                  <p className="text-sm transition-colors dark:text-slate-300">
                    Вы уверены, что хотите удалить переписку с наставником <span className="font-semibold">{mentor.name}</span>? Вернуть историю будет невозможно.
                  </p>
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setShowConfirmDelete(null)}
                      className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 shadow-sm transition hover:-translate-y-0.5 dark:border-slate-700/60 dark:bg-slate-800/70 dark:text-slate-200"
                    >
                      Отмена
                    </button>
                    <button
                      onClick={() => handleDelete(mentor.id)}
                      className="rounded-full bg-gradient-to-r from-rose-300 to-rose-400 px-4 py-2 text-sm font-semibold text-rose-900 shadow transition hover:-translate-y-0.5 dark:from-rose-500 dark:to-rose-600 dark:text-rose-100"
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
