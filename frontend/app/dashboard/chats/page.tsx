"use client"  // Добавляем директиву для клиента
import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Sidebar from "./components/Sidebar"  // Импортируем Sidebar
import ChatWindow from "./components/ChatWindow"
import LogoLoader from "@/components/LogoLoader"

interface Mentor {
  id: string
  name: string
  subject: string
  description: string
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
          setSelectedMentorId(data[0].id)
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
  }

  const handleSendMessage = async (message: string) => {
    const token = localStorage.getItem("access_token")
    if (!token || !selectedMentorId) return

    try {
      const res = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          prompt: message,
          mentor_id: selectedMentorId,
        }),
      })

      const data = await res.json()
      console.log("AI ответ:", data.response)
    } catch (err) {
      console.error("Ошибка отправки сообщения", err)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <LogoLoader size={96} />
        <p className="mt-4 text-gray-500 text-sm">Загружаем чаты...</p>
      </div>
    )
  }

  return (
    <div className="flex h-full">
      <Sidebar
        mentors={mentors}
        onSelect={setSelectedMentorId}
        onDelete={handleDeleteMentor}  // передаем колбэк удаления
      />
      <div className="flex-1 ml-4">
        {selectedMentorId ? (
          <ChatWindow
            selectedMentorId={selectedMentorId}
            onSendMessage={handleSendMessage}
          />
        ) : (
          <p>Выберите ментора слева.</p>
        )}
      </div>
    </div>
  )
}