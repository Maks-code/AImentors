// Файл: app/(dashboard)/mentors/components/MentorList.tsx

"use client"

import { useEffect, useState } from "react"
import MentorCard from "@/app/dashboard/mentors/components/MentorCard"

interface Mentor {
  id: string
  name: string
  subject: string
  description: string
  category: string
}

export default function MentorList() {
  const [mentors, setMentors] = useState<Mentor[]>([])
  const [search, setSearch] = useState("")

  useEffect(() => {
    const fetchMentors = async () => {
      const res = await fetch("http://localhost:8000/mentors")
      const data = await res.json()
      setMentors(data)
    }

    fetchMentors()
  }, [])

  const filtered = mentors.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.subject.toLowerCase().includes(search.toLowerCase())
  )

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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((mentor) => (
          <MentorCard key={mentor.id} mentor={mentor} />
        ))}
      </div>
    </div>
  )
}