// components/AskModal.tsx
// Компонент модального окна для отправки вопроса ментору.
// Отправляет запрос на backend (/chat) с prompt и mentor_id.
// Отображает ответ от ИИ.

"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface Mentor {
  id: string
  name: string
  subject: string
  description: string
}

interface AskModalProps {
  open: boolean
  onClose: () => void
  mentor: Mentor
}

export default function AskModal({ open, onClose, mentor }: AskModalProps) {
  const [question, setQuestion] = useState("")
  const [answer, setAnswer] = useState("")
  const [loading, setLoading] = useState(false)

  const handleAsk = async () => {
    setLoading(true)
    try {
      const res = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ mentor_id: mentor.id, prompt: question }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || "Ошибка")

      setAnswer(data.response || "AI не дал ответ")
    } catch (err: any) {
      setAnswer("Ошибка: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Вопрос ментору: {mentor.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <textarea
            className="w-full border rounded p-2 text-sm"
            placeholder="Задай вопрос..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />

          <Button onClick={handleAsk} disabled={loading || !question} className="w-full">
            {loading ? "Отправка..." : "Спросить"}
          </Button>

          {answer && (
            <div className="border p-3 rounded bg-gray-50 text-sm whitespace-pre-line">
              <strong>Ответ ИИ:</strong>
              <p>{answer}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}