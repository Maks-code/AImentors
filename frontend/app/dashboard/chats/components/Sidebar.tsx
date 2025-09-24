// Файл: app/(dashboard)/chats/components/Sidebar.tsx
"use client"

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
    <aside className="w-64 h-full border-r border-gray-200 p-4 overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4">Мои менторы</h2>
      {mentors.length === 0 && <p className="text-sm text-gray-500">Нет чатов</p>}
      <ul className="space-y-2">
        {mentors.map((mentor) => (
          <li key={mentor.id} className="relative">
            <button
              onClick={() => handleSelect(mentor.id)}
              className={`w-full flex items-center gap-3 text-left p-2 rounded-lg transition ${
                activeMentor === mentor.id
                  ? "bg-blue-100 text-blue-800 font-semibold"
                  : "hover:bg-gray-100"
              }`}
            >
              {/* Аватар */}
<div className="w-14 h-14 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
  {mentor.avatar_url ? (
    <img
      src={`/${mentor.avatar_url}`} // ожидаем относительный путь из public
      alt={mentor.name}
      className="w-full h-full object-cover"
    />
  ) : (
    <img
      src="/default-avatar.png" // fallback если нет аватара
      alt="Нет аватара"
      className="w-full h-full object-cover"
    />
  )}
</div>
              <div>
                <div className="text-sm">{mentor.name}</div>
                <div className="text-xs text-gray-500">{mentor.subject}</div>
              </div>
            </button>
            
            {/* Кнопка удаления */}
            <button
              onClick={() => setShowConfirmDelete(mentor.id)} // показываем окно подтверждения
              className="absolute top-2 right-2 text-red-600 hover:text-red-800"
              title="Удалить историю"
              disabled={deleting} // блокируем кнопку, пока идет процесс удаления
            >
              🗑️
            </button>

            {/* Модальное окно с подтверждением удаления */}
            {showConfirmDelete === mentor.id && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                <div className="bg-white p-6 rounded-lg shadow-lg w-80">
                  <h3 className="text-xl mb-4">Подтвердите удаление</h3>
                  <p>Вы уверены, что хотите удалить всю историю чатов с этим наставником?</p>
                  <div className="mt-4 flex justify-between">
                    <button
                      onClick={() => setShowConfirmDelete(null)} // закрываем окно подтверждения
                      className="bg-gray-200 text-black px-4 py-2 rounded"
                    >
                      Отмена
                    </button>
                    <button
                      onClick={() => handleDelete(mentor.id)} // вызываем метод удаления
                      className="bg-red-500 text-white px-4 py-2 rounded"
                      disabled={deleting} // блокируем кнопку, пока идет процесс удаления
                    >
                      {deleting ? 'Удаление...' : 'Да, удалить'}
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