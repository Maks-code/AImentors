// app/dashboard/chats/components/ChatWindow.tsx
"use client"

// Надо чото решить с автопрокруткой тк щас она крутит от самого первого сообщения до последнего а это нагрузка
// надо сделать пагинацию для норм загрузки

import { useState, useEffect, useRef, useCallback } from "react"
import PlanMessage from "./PlanMessage"

type PlanTask = {
  id?: string
  question?: string
  title?: string
  type?: string
}

type PlanLesson = {
  id?: string
  title?: string
  type?: string
  tasks?: PlanTask[] | null
}

type PlanModule = {
  id?: string
  title?: string
  description?: string
  lessons?: PlanLesson[] | null
}

type PlanSnapshot = {
  id?: string
  title?: string
  description?: string
  modules?: PlanModule[] | null
}

type PlanStatus = "active" | "confirmed" | "completed" | "deleted"

interface Message {
  role?: "user" | "assistant"
  content?: string
  prompt?: string
  response?: string
  created_at?: string
  planDraft?: PlanSnapshot | null
  plan_id?: string
  plan_snapshot?: PlanSnapshot | null
  plan_status?: PlanStatus
}

interface ChatWindowProps {
  selectedMentorId: string | null
}

interface ChatHistoryItem {
  id: string
  prompt: string
  response: string
  created_at: string
  plan_id?: string | null
  plan_snapshot?: PlanSnapshot | null
  plan_status?: PlanStatus | null
}

interface ChatSendResponse {
  response?: string
  planDraft?: PlanSnapshot | null
  plan_id?: string | null
  plan_status?: PlanStatus | null
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

export default function ChatWindow({ selectedMentorId }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

  // хелпер: подтянуть статус плана и обновить конкретное сообщение
  const syncPlanStatus = useCallback(async (planId: string) => {
    try {
      const token = localStorage.getItem("access_token")
      if (!token) return

      const res = await fetch(`${base}/learning/plans/${planId}/status`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.status === 404) {
        setMessages((prev) =>
          prev.map((m) =>
            m.plan_id === planId ? { ...m, plan_status: "deleted" } : m
          )
        )
        return
      }

      if (!res.ok) return
      const payload = await res.json()
      const status = (payload?.status as PlanStatus) || "active"

      setMessages((prev) =>
        prev.map((m) =>
          m.plan_id === planId ? { ...m, plan_status: status } : m
        )
      )
    } catch {
      /* noop */
    }
  }, [base])

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
        const data: unknown = await res.json()
        const history: ChatHistoryItem[] = Array.isArray(data) ? (data as ChatHistoryItem[]) : []

        const formatted: Message[] = history.flatMap((item) => {
          const userMessage: Message = {
            role: "user",
            content: item.prompt,
            created_at: item.created_at,
          }

          const assistantMessage: Message = item.plan_snapshot
            ? {
                role: "assistant",
                content: item.response,
                created_at: item.created_at,
                plan_snapshot: item.plan_snapshot,
                plan_id: item.plan_id ?? undefined,
                plan_status: item.plan_status ?? undefined,
              }
            : {
                role: "assistant",
                content: item.response,
                created_at: item.created_at,
              }

          return [userMessage, assistantMessage]
        })

        setMessages(formatted)

        const plansToSync = formatted
          .filter((m) => m.plan_id && !m.plan_status)
          .map((m) => m.plan_id!)

        for (const pid of plansToSync) {
          await syncPlanStatus(pid)
        }
      } catch (err) {
        console.error("❌ Ошибка загрузки истории:", err)
      }
    }

    fetchHistory()
  }, [selectedMentorId, base, syncPlanStatus])

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

      const data: ChatSendResponse = await res.json()
      const aiAnswer = data?.response
      if (!aiAnswer || String(aiAnswer).trim() === "") {
        throw new Error("Модель не вернула ответ. Попробуйте ещё раз.")
      }

      const aiMessage: Message = {
        role: "assistant",
        content: aiAnswer,
        created_at: new Date().toISOString(),
      }

      if (data.planDraft) {
        aiMessage.planDraft = data.planDraft
      }

      if (data.plan_id) {
        aiMessage.plan_id = data.plan_id
        aiMessage.plan_status = data.plan_status ?? "active"
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
    <div className="flex h-full flex-col gap-4 rounded-3xl border border-white/60 bg-white/75 p-5 shadow-xl shadow-slate-200/70 backdrop-blur-xl">
      <div className="flex-1 space-y-3 overflow-y-auto pr-1">
        {messages.map((msg, idx) => {
          const isUser = msg.role === "user"
          const showPlan = Boolean(msg.planDraft || msg.plan_snapshot)
          const planData = msg.planDraft || msg.plan_snapshot

          return (
            <div
              key={idx}
              className={`space-y-1 flex flex-col ${isUser ? "items-end" : "items-start"}`}
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
                  className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm shadow-md whitespace-pre-wrap transition ${
                    isUser
                      ? "bg-gradient-to-br from-sky-200/80 to-indigo-200/80 text-slate-800"
                      : "bg-slate-50/90 text-slate-600"
                  }`}
                >
                  {msg.content}
                </div>
              )}

              {msg.created_at && (
                <div className="text-xs text-slate-400">
                  {new Date(msg.created_at).toLocaleString()}
                </div>
              )}
            </div>
          )
        })}

        {loading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-2xl bg-slate-50/80 px-4 py-3 text-sm text-slate-500 shadow-inner">
              <TypingIndicator />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white/90 p-3 shadow-inner">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="flex-1 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-200"
          placeholder="Введите сообщение..."
          disabled={loading}
        />
        <button
          onClick={handleSend}
          disabled={loading}
          className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition ${
            loading
              ? "cursor-not-allowed bg-slate-100 text-slate-400"
              : "bg-gradient-to-r from-sky-300 via-indigo-300 to-violet-300 text-slate-900 shadow-lg shadow-sky-100/60 hover:-translate-y-0.5"
          }`}
        >
          Отправить
        </button>
      </div>
    </div>
  )
}
