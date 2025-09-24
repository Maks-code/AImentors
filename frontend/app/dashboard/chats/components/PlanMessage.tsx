"use client"

interface Task {
  question: string
  type?: string
  answer?: string
}

interface Lesson {
  title: string
  type?: string
  tasks?: Task[]
}

interface Module {
  title: string
  description?: string
  lessons?: Lesson[]
}

interface PlanDraft {
  title: string
  description?: string
  modules?: Module[]
}

interface PlanMessageProps {
  plan: PlanDraft
}

export default function PlanMessage({ plan }: PlanMessageProps) {
  return (
    <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-sm space-y-3 max-w-[90%]">
      <h3 className="text-lg font-semibold">📋 {plan.title}</h3>
      {plan.description && <p className="text-gray-700">{plan.description}</p>}

      {plan.modules?.map((module, mIdx) => (
        <div key={mIdx} className="pl-2 border-l-2 border-green-400 space-y-2">
          <p className="font-medium">
            {mIdx + 1}. Модуль: {module.title}
          </p>
          {module.description && (
            <p className="text-gray-600 text-xs">{module.description}</p>
          )}

          {module.lessons?.map((lesson, lIdx) => (
            <div key={lIdx} className="ml-4 pl-2 border-l border-gray-300">
              <p className="text-sm">
                {mIdx + 1}.{lIdx + 1}. Урок: {lesson.title}{" "}
                {lesson.type && (
                  <span className="text-xs text-gray-500">(Тип: {lesson.type})</span>
                )}
              </p>

              {lesson.tasks?.map((task, tIdx) => (
                <div key={tIdx} className="ml-4 text-xs text-gray-700">
                  <p>
                    {mIdx + 1}.{lIdx + 1}.{tIdx + 1}. Задание: {task.question}
                  </p>
                  {task.answer && (
                    <p className="text-gray-500">💡 Ответ: {task.answer}</p>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}