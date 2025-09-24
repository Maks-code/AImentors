// app/dashboard/chats/components/PlanMessage.tsx
"use client"

interface PlanMessageProps {
  plan: any
  plan_id: string
  plan_status?: "active" | "confirmed" | "deleted"
  onConfirm?: () => void
  onReject?: () => void
}

export default function PlanMessage({ plan, plan_id, plan_status, onConfirm, onReject }: PlanMessageProps) {
  return (
    <div className="p-3 border rounded-lg bg-white shadow-md w-full max-w-lg">
      <h3 className="text-lg font-bold mb-2">📋 План: {plan.title}</h3>
      <p className="text-sm text-gray-600 mb-3">{plan.description}</p>

      {plan.modules?.map((module: any, mIdx: number) => (
        <div key={mIdx} className="mb-2">
          <h4 className="font-semibold">Модуль {mIdx + 1}: {module.title}</h4>
          <p className="text-xs text-gray-500 mb-1">{module.description}</p>
          {module.lessons?.map((lesson: any, lIdx: number) => (
            <div key={lIdx} className="ml-4 mb-1">
              <p className="text-sm">📖 {lesson.title} <span className="italic text-gray-500">({lesson.type})</span></p>
              {lesson.tasks?.map((task: any, tIdx: number) => (
                <p key={tIdx} className="ml-6 text-xs text-gray-700">— {task.question}</p>
              ))}
            </div>
          ))}
        </div>
      ))}

      {/* Кнопки управления */}
      {plan_status === "active" && (
        <div className="flex gap-2 mt-3">
          {onConfirm && (
            <button
              onClick={onConfirm}
              className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
            >
              ✅ Принять
            </button>
          )}
          {onReject && (
            <button
              onClick={onReject}
              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            >
              ❌ Отклонить
            </button>
          )}
        </div>
      )}

      {plan_status === "confirmed" && (
        <p className="mt-2 text-green-600 font-semibold">✔ План принят</p>
      )}

      {plan_status === "deleted" && (
        <p className="mt-2 text-red-600 font-semibold">✖ План отклонён</p>
      )}
    </div>
  )
}