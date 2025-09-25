"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Sidebar from "./components/Sidebar"
import ChatWindow from "./components/ChatWindow"
import LogoLoader from "@/components/LogoLoader"

interface Mentor {
  id: string;
  name: string;
  subject: string;
  description: string;
  avatar_url?: string;
  category: string;
}

export default function ChatPage() {
  const [mentors, setMentors] = useState<Mentor[]>([])
  const [selectedMentorId, setSelectedMentorId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()

  useEffect(() => {
    const fetchMentors = async () => {
      const token = localStorage.getItem("access_token")
      if (!token) return

      try {
        const res = await fetch("http://localhost:8000/chat/history", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const data = await res.json()
        setMentors(data)

        const selectedFromURL = searchParams.get("selected")

        if (selectedFromURL && data.some((m: Mentor) => m.id === selectedFromURL)) {
          setSelectedMentorId(selectedFromURL)
        } else if (data.length > 0) {
          setSelectedMentorId(null)
        }
      } catch (err) {
        console.error("Ошибка загрузки списка менторов", err)
      } finally {
        setLoading(false)
      }
    }

    fetchMentors()
  }, [searchParams])

  const handleDeleteMentor = (mentorId: string) => {
    setMentors((prevMentors) =>
      prevMentors.filter((mentor) => mentor.id !== mentorId)
    )
    setSelectedMentorId(null) // После удаления сбрасываем выбранного ментора
  }

  if (loading) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 text-slate-500">
        <LogoLoader size={80} />
        <p className="text-sm font-medium">Загружаем чаты...</p>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-220px)] min-h-[600px] w-full flex-col gap-4 overflow-hidden lg:flex-row">
      <div className="flex-none overflow-hidden rounded-3xl">
        <Sidebar mentors={mentors} onSelect={setSelectedMentorId} onDelete={handleDeleteMentor} />
      </div>
      <div className="flex h-full min-h-[480px] flex-1 overflow-hidden">
        {selectedMentorId ? (
          <ChatWindow selectedMentorId={selectedMentorId} />
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white/75 p-10 text-center text-sm text-slate-500 shadow-xl shadow-slate-200/60">
            Выберите наставника слева, чтобы продолжить диалог.
          </div>
        )}
      </div>
    </div>
  )
}
