// frontend/components/ChatWindow.tsx
// Компонент окна чата: отображает историю и позволяет отправлять сообщения AI-ментору

"use client"

import { useState, useEffect, useRef } from "react"

interface Message {
  role?: "user" | "assistant"
  content?: string
  prompt?: string
  response?: string
  created_at?: string
}

interface ChatWindowProps {
  selectedMentorId: string | null
  onSendMessage: (message: string) => void
}
// функция 3-х точек когда иИ думает, поменять на поориганльнее!
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

  useEffect(() => {
    const fetchHistory = async () => {
      if (!selectedMentorId) return

      const token = localStorage.getItem("access_token")
      if (!token) return

      try {
        const res = await fetch(`http://localhost:8000/chat/history/${selectedMentorId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const data = await res.json()

        const formatted = data.flatMap((m: any) => [
          { role: "user", content: m.prompt, created_at: m.created_at },
          { role: "assistant", content: m.response, created_at: m.created_at },
        ])

        setMessages(formatted)
      } catch (err) {
        console.error("❌ Ошибка загрузки истории:", err)
      }
    }

    fetchHistory()
  }, [selectedMentorId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || !selectedMentorId) return

    const token = localStorage.getItem("access_token")
    if (!token) return alert("Вы не авторизованы")

    const userMessage: Message = {
      role: "user",
      content: input,
      created_at: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setLoading(true)

    try {
      const res = await fetch("http://localhost:8000/chat/send", {
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
      if (!res.ok) throw new Error(data.detail || "Ошибка AI")

      const aiMessage: Message = {
        role: "assistant",
        content: data.response,
        created_at: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, aiMessage])
    } catch (err) {
      console.error("Ошибка при отправке запроса:", err)
      alert("AI не дал ответ")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full border rounded-lg p-4">
      {/* История сообщений */}
      <div className="flex-1 overflow-y-auto space-y-2 mb-4 max-h-[65vh]">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`space-y-1 mb-4 flex flex-col ${
              msg.role === "user" ? "items-end" : "items-start"
            }`}
          >
            <div
              className={`p-2 rounded text-sm whitespace-pre-wrap max-w-[75%] ${
                msg.role === "user" ? "bg-blue-100" : "bg-gray-100"
              }`}
            >
              {msg.content}
            </div>
            {msg.created_at && (
              <div className="text-xs text-gray-500">
                {new Date(msg.created_at).toLocaleString()}
              </div>
            )}
          </div>
        ))}
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