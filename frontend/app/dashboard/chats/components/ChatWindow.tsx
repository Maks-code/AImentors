// app/dashboard/chats/components/ChatWindow.tsx
"use client"

// Надо чото решить с автопрокруткой тк щас она крутит от самого первого сообщения до последнего а это нагрузка
// надо сделать пагинацию для норм загрузки

import { useState, useEffect, useRef } from "react"
import PlanMessage from "./PlanMessage"

interface Message {
  role?: "user" | "assistant"
  content?: string
  prompt?: string
  response?: string
  created_at?: string
  // плановые поля
  planDraft?: any
  plan_id?: string
  plan_snapshot?: any
  plan_status?: "active" | "confirmed" | "deleted"
}

interface ChatWindowProps {
  selectedMentorId: string | null
  onSendMessage: (message: string) => void
}

function TypingIndicator() {
  return (
    <div className="flex gap-1 text-sm text-gray-500 animate-pulse">
      <span>.</span>
      <span>.</span>
      <span>.</span>
    </div>
  )
}

export default function ChatWindow({ selectedMentorId, onSendMessage }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

  // хелпер: подтянуть статус плана и обновить конкретное сообщение
  const syncPlanStatus = async (planId: string) => {
    try {
      const token = localStorage.getItem("access_token")
      if (!token) return

      const res = await fetch(`${base}/learning/plans/${planId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) return
      const plan = await res.json()
      const status = (plan?.status as Message["plan_status"]) || "active"

      setMessages((prev) =>
        prev.map((m) =>
          m.plan_id === planId ? { ...m, plan_status: status } : m
        )
      )
    } catch {
      /* noop */
    }
  }

  const handleConfirm = async (plan_id: string) => {
    try {
      const token = localStorage.getItem("access_token")
      if (!token) throw new Error("No access token")

      const res = await fetch(`${base}/learning/plans/${plan_id}/confirm`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData?.message || "Ошибка подтверждения плана")
      }

      // оптимистично сразу меняем UI
      setMessages((prev) =>
        prev.map((m) =>
          m.plan_id === plan_id ? { ...m, plan_status: "confirmed" } : m
        )
      )
      // и дополнительно синкаем с бэком (на случай гонок)
      await syncPlanStatus(plan_id)
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Неизвестная ошибка при подтверждении плана")
    }
  }

  const handleReject = async (plan_id: string) => {
    try {
      const token = localStorage.getItem("access_token")
      if (!token) throw new Error("No access token")

      const res = await fetch(`${base}/learning/plans/${plan_id}/reject`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData?.message || "Ошибка отклонения плана")
      }

      // оптимистично сразу меняем UI
      setMessages((prev) =>
        prev.map((m) =>
          m.plan_id === plan_id ? { ...m, plan_status: "deleted" } : m
        )
      )
      // и синкаем с бэком
      await syncPlanStatus(plan_id)
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Неизвестная ошибка при отклонении плана")
    }
  }

  // загрузка истории
  useEffect(() => {
    const fetchHistory = async (limit = 50, offset = 0) => {
      if (!selectedMentorId) return
      const token = localStorage.getItem("access_token")
      if (!token) return

      try {
        const res = await fetch(
          `${base}/chat/history/${selectedMentorId}?limit=${limit}&offset=${offset}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        const data = await res.json()

        // ожидаем, что бэк (желательно) вернёт plan_status; если нет — пусть будет undefined
        const formatted: Message[] = data.flatMap((m: any) => [
          { role: "user", content: m.prompt, created_at: m.created_at },
          m.plan_snapshot
            ? {
                role: "assistant",
                content: m.response,
                created_at: m.created_at,
                plan_snapshot: m.plan_snapshot,
                plan_id: m.plan_id,
                plan_status: m.plan_status as Message["plan_status"] | undefined,
              }
            : {
                role: "assistant",
                content: m.response,
                created_at: m.created_at,
              },
        ])

        setMessages(formatted)

        // если статуса нет, но есть plan_id — подтянем его по API (для старых сообщений)
        const plansToSync = formatted
          .filter((m) => m.plan_id && !m.plan_status)
          .map((m) => m.plan_id!) // non-null
        // последовательный sync (их обычно немного)
        for (const pid of plansToSync) {
          await syncPlanStatus(pid)
        }
      } catch (err) {
        console.error("❌ Ошибка загрузки истории:", err)
      }
    }

    fetchHistory()
  }, [selectedMentorId])

  // автоскролл вниз
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || !selectedMentorId) return

    const userMessage: Message = {
      role: "user",
      content: input,
      created_at: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setLoading(true)

    try {
      const token = localStorage.getItem("access_token")
      const res = await fetch(`${base}/chat/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          prompt: input,
          mentor_id: selectedMentorId,
        }),
      })

      const data = await res.json()
      const aiAnswer = data?.response
      if (!aiAnswer || String(aiAnswer).trim() === "") {
        throw new Error("Модель не вернула ответ. Попробуйте ещё раз.")
      }

      const aiMessage: Message = {
        role: "assistant",
        content: aiAnswer,
        created_at: new Date().toISOString(),
        ...(data.planDraft ? { planDraft: data.planDraft } : {}),
        ...(data.plan_id ? { plan_id: data.plan_id, plan_status: "active" } : {}), // новый план = активный
      }

      setMessages((prev) => [...prev, aiMessage])

      // если бэк не вернул статус, но вернул plan_id — подстрахуемся и дёрнем статус
      if (data.plan_id) {
        await syncPlanStatus(data.plan_id as string)
      }
    } catch (err: unknown) {
      console.error("Ошибка при отправке запроса:", err)
      alert(err instanceof Error ? err.message : "Неизвестная ошибка")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full border rounded-lg p-4">
      {/* История сообщений */}
      <div className="flex-1 overflow-y-auto space-y-2 mb-4 max-h-[65vh]">
        {messages.map((msg, idx) => {
          const isUser = msg.role === "user"
          const showPlan = Boolean(msg.planDraft || msg.plan_snapshot)
          const planData = msg.planDraft || msg.plan_snapshot

          return (
            <div
              key={idx}
              className={`space-y-1 mb-4 flex flex-col ${isUser ? "items-end" : "items-start"}`}
            >
              {showPlan ? (
                <PlanMessage
                  plan={planData}
                  plan_id={msg.plan_id || ""}
                  plan_status={msg.plan_status}
                  onConfirm={
                    msg.plan_id && msg.plan_status !== "confirmed" && msg.plan_status !== "deleted"
                      ? () => handleConfirm(msg.plan_id!)
                      : undefined
                  }
                  onReject={
                    msg.plan_id && msg.plan_status !== "confirmed" && msg.plan_status !== "deleted"
                      ? () => handleReject(msg.plan_id!)
                      : undefined
                  }
                />
              ) : (
                <div
                  className={`p-2 rounded text-sm whitespace-pre-wrap max-w-[75%] ${
                    isUser ? "bg-blue-100" : "bg-gray-100"
                  }`}
                >
                  {msg.content}
                </div>
              )}

              {msg.created_at && (
                <div className="text-xs text-gray-500">
                  {new Date(msg.created_at).toLocaleString()}
                </div>
              )}
            </div>
          )
        })}

        {loading && (
          <div className="flex justify-start mb-2">
            <div className="bg-gray-100 p-2 rounded text-sm max-w-[80%]">
              <TypingIndicator />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Поле ввода */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="flex-1 border rounded p-2"
          placeholder="Введите сообщение..."
          disabled={loading}
        />
        <button
          onClick={handleSend}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          Отправить
        </button>
      </div>
    </div>
  )
}