// Файл: app/(dashboard)/mentors/page.tsx
"use client"

import { useEffect, useState } from "react"
import MentorCard from "./components/MentorCard"
import MentorModal from "./components/MentorModal"
import LogoLoader from "@/components/LogoLoader"
interface Mentor {
  id: string
  name: string
  subject: string
  description: string
  avatar_url?: string
  category: string
}

export default function MentorsPage() {
  const [mentors, setMentors] = useState<Mentor[]>([])
  const [search, setSearch] = useState("")
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null)
  const [loading, setLoading] = useState(true)
  
  
  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const res = await fetch("http://localhost:8000/mentors")
        const data = await res.json()
        setMentors(data)
      } catch (err) {
        console.error("Ошибка загрузки менторов", err)
      } finally {
        setLoading(false)
      }
    }

    fetchMentors()
  }, [])
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <LogoLoader size={96} />
        <p className="mt-4 text-gray-500 text-sm">Загружаем менторов...</p>
      </div>
    )
  }
  const filteredMentors = mentors.filter(
    (mentor) =>
      mentor.name.toLowerCase().includes(search.toLowerCase()) ||
      mentor.subject.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Все менторы</h1>

      {/* Поиск */}
      <div className="max-w-md">
        <input
          type="text"
          placeholder="Поиск по имени или направлению..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      {Object.entries(
  filteredMentors.reduce((acc, mentor) => {
    const key = mentor.subject
    if (!acc[key]) acc[key] = []
    acc[key].push(mentor)
    return acc
  }, {} as Record<string, Mentor[]>)
).map(([subject, mentors]) => (
  <div key={subject} className="space-y-2">
    <h2 className="text-xl font-semibold">{subject}</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {mentors.map((mentor) => (
        <MentorCard key={mentor.id} mentor={mentor} onClick={() => setSelectedMentor(mentor)} />
      ))}
    </div>
  </div>
))}

      {/* Модалка */}
      {selectedMentor && (
        <MentorModal mentor={selectedMentor} onClose={() => setSelectedMentor(null)} />
      )}
    </div>
  )
}