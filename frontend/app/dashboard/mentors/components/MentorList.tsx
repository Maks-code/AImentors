"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import MentorCard from "@/app/dashboard/mentors/components/MentorCard"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

interface Mentor {
  id: string
  name: string
  subject?: string | null
  description?: string | null
  avatar_url?: string | null
  category?: string | null
}

export default function MentorList() {
  const [mentors, setMentors] = useState<Mentor[]>([])
  const [search, setSearch] = useState("")
  const router = useRouter()

  useEffect(() => {
    const fetchMentors = async () => {
      const res = await fetch(`${API_BASE}/mentors`)
      const data = await res.json()
      setMentors(data)
    }

    fetchMentors()
  }, [])

  const filtered = mentors.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      (m.subject ?? "").toLowerCase().includes(search.toLowerCase())
  )

  const handleStartChat = async (mentor: Mentor) => {
    if (typeof window === "undefined") return

    const normalized = {
      id: mentor.id,
      name: mentor.name,
      subject: mentor.subject ?? "",
      description: mentor.description ?? "",
      avatar_url: mentor.avatar_url ?? null,
      category: mentor.category ?? "AI наставник",
    }

    try {
      sessionStorage.setItem("pending_mentor_chat", JSON.stringify(normalized))
    } catch (error) {
      console.error("Не удалось сохранить данные наставника", error)
    }

    const token = localStorage.getItem("access_token")
    if (!token) {
      router.push("/auth?mode=register")
      return
    }

    const welcomeText =
      "Привет! Ты мой новый наставник. Подскажи, что тебе нужно узнать обо мне, чтобы помочь с обучением."

    try {
      const res = await fetch(`${API_BASE}/chat/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          prompt: welcomeText,
          mentor_id: mentor.id,
        }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(
          typeof data?.detail === "string"
            ? data.detail
            : "Не удалось отправить приветственное сообщение"
        )
      }

      sessionStorage.setItem(`welcome_sent_${mentor.id}`, "sent")
    } catch (error) {
      console.error("Ошибка при отправке приветственного сообщения", error)
      sessionStorage.removeItem(`welcome_sent_${mentor.id}`)
    }

    router.push(`/dashboard/chats?selected=${mentor.id}`)
  }

  return (
    <div className="space-y-6">
      <div>
        <input
          type="text"
          placeholder="Поиск по имени или предмету"
          className="w-full border rounded px-3 py-2"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((mentor) => (
          <MentorCard key={mentor.id} mentor={mentor} onStartChat={handleStartChat} />
        ))}
      </div>
    </div>
  )
}
