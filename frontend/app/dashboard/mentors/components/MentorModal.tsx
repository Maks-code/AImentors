// Файл: app/(dashboard)/mentors/components/MentorModal.tsx
"use client"

import { Dialog } from "@headlessui/react"
import { useState } from "react"
import { useRouter } from "next/navigation"

interface Mentor {
  id: string
  name: string
  subject: string
  description: string
  avatar_url?: string
  category: string
}

interface MentorModalProps {
  mentor: Mentor
  onClose: () => void
}

export default function MentorModal({ mentor, onClose }: MentorModalProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleStartChat = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("access_token")
      const res = await fetch("http://localhost:8000/chat/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          prompt: "Привет, ты мой новый ментор. Хочу начать обучение.",
          mentor_id: mentor.id,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || "Ошибка старта чата")
      router.push(`/dashboard/chats?selected=${mentor.id}`)
    } catch (err) {
      console.error(err)
      alert("Не удалось начать чат")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={!!mentor} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-lg max-w-lg w-full p-6 space-y-4 shadow-xl">
          <div className="flex flex-col items-center">
            <div className="w-28 h-28 rounded-full overflow-hidden bg-gray-200 shadow-md transform transition-transform hover:scale-105">
              <img
                src={mentor.avatar_url || "/default-avatar.png"}
                alt={mentor.name}
                className="w-full h-full object-cover"
              />
            </div>
            <Dialog.Title className="text-xl font-bold mt-4 text-center">
              {mentor.name}
            </Dialog.Title>
            <p className="text-sm text-gray-500 text-center">
              {mentor.subject} · {mentor.category}
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-gray-700 leading-relaxed">
              {mentor.description}
            </p>
            {/* Здесь позже появится мини-история, достижения и т.п. */}
          </div>

          <button
            onClick={handleStartChat}
            disabled={loading}
            className="w-full py-3 text-white rounded bg-blue-600 hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Запуск..." : "Начать чат"}
          </button>

          <button
            onClick={onClose}
            className="mt-2 text-sm text-gray-500 hover:underline w-full text-center"
          >
            Закрыть
          </button>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}