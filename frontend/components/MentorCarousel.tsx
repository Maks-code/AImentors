// Компонент-карусель для отображения менторов.
// Позволяет пользователю выбрать ментора и открыть AskModal.

"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import AskModal from "@/components/AskModal"




interface Mentor {
  id: string
  name: string
  subject: string
  description: string
}

export function MentorCarousel() {
  const [mentors, setMentors] = useState<Mentor[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null)
  useEffect(() => {
    fetch("http://localhost:8000/mentors")
      .then((res) => res.json())
      .then((data) => {
        setMentors(data)
      })
      .catch((err) => console.error("Ошибка при получении менторов:", err))
  }, [])

  return (
    <section className="py-20 bg-gray-100">
      <h2 className="text-3xl font-bold text-center mb-8">Попробуй менторов</h2>

      <div
        ref={scrollRef}
        className="flex overflow-x-auto gap-6 px-4 no-scrollbar scroll-smooth"
        style={{ scrollBehavior: "smooth" }}
      >
        {mentors.map((mentor, index) => (
          <div
            key={mentor.id + "-" + index}
            className="min-w-[280px] flex-shrink-0 p-5 bg-white rounded-lg shadow hover:scale-105 transition"
          >
            <div className="flex items-center justify-center mb-4">
              <img
                src="/MaxFace.jpeg"
                alt="AI Mentor Avatar"
                className="w-16 h-16 rounded-full border border-gray-300 shadow"
              />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-center">{mentor.name}</h3>
            <p className="text-muted-foreground mb-1 text-center">{mentor.subject}</p>
            <p className="text-sm text-gray-500 line-clamp-4 text-center">{mentor.description}</p>
            <Button
              className="mt-4 w-full"
              onClick={() => {
                const token = localStorage.getItem("token")
                if (!token) {
                  router.push("/auth")
                } else {
                  setSelectedMentor(mentor)
                }
              }}
            >
              Спросить
            </Button>
          </div>
        ))}
      </div>

      {selectedMentor && (
  <AskModal
    open={!!selectedMentor}
    onClose={() => setSelectedMentor(null)}
    mentor={selectedMentor}
/>
)}
    </section>
  )
}