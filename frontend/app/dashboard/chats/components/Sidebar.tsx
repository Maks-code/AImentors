// Файл: app/(dashboard)/chats/components/Sidebar.tsx
"use client"

import { useState } from "react"

interface Mentor {
  id: string
  name: string
  subject: string
  description: string
  avatar_url?: string
}

interface SidebarProps {
  mentors: Mentor[]
  onSelect: (mentorId: string) => void
}

export default function Sidebar({ mentors, onSelect }: SidebarProps) {
  const [activeMentor, setActiveMentor] = useState<string | null>(null)

  const handleSelect = (id: string) => {
    setActiveMentor(id)
    onSelect(id)
  }

  return (
    <aside className="w-64 h-full border-r border-gray-200 p-4 overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4">Мои менторы</h2>
      {mentors.length === 0 && <p className="text-sm text-gray-500">Нет чатов</p>}
      <ul className="space-y-2">
        {mentors.map((mentor) => (
          <li key={mentor.id}>
            <button
              onClick={() => handleSelect(mentor.id)}
              className={`w-full flex items-center gap-3 text-left p-2 rounded-lg transition ${
                activeMentor === mentor.id
                  ? "bg-blue-100 text-blue-800 font-semibold"
                  : "hover:bg-gray-100"
              }`}
            >
              <img
                src={mentor.avatar_url || `https://i.pravatar.cc/40?u=${mentor.id}`}
                alt={mentor.name}
                className="w-8 h-8 rounded-full object-cover"
              />
              <div>
                <div className="text-sm">{mentor.name}</div>
                <div className="text-xs text-gray-500">{mentor.subject}</div>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </aside>
  )
}