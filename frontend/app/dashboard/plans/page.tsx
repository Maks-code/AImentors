"use client"

import { useEffect, useState } from "react"

interface Plan {
  id: string
  title: string
  description?: string
  mentor_id: string
  status: string
  created_at: string
}

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("access_token")
    if (!token) return

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/learning/plans`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setPlans(data)
        }
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <p className="text-gray-600">Загрузка планов...</p>
  }

  if (!plans.length) {
    return <p className="text-gray-600">У вас пока нет планов</p>
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Мои планы</h1>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="min-w-[250px] rounded-xl border bg-white/70 shadow p-4 hover:shadow-md transition"
          >
            <h2 className="text-lg font-semibold">{plan.title}</h2>
            <p className="text-sm text-gray-600 line-clamp-2">
              {plan.description || "Без описания"}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Статус: <span className="font-medium">{plan.status}</span>
            </p>
            <p className="text-xs text-gray-500">
              Дата: {new Date(plan.created_at).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}