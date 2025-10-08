// app/dashboard/chats/components/PlanMessage.tsx
"use client"

import { useMemo } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

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
  theory?: string
  content?: unknown
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

interface PlanMessageProps {
  plan: PlanSnapshot | null
  plan_id: string
  plan_status?: PlanStatus
  onConfirm?: () => void
  onReject?: () => void
}

const STATUS_META: Record<PlanStatus | "untracked", { label: string; className: string }> = {
  active: {
    label: "Новый план",
    className: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-200",
  },
  confirmed: {
    label: "План принят",
    className: "bg-green-100 text-green-700 dark:bg-emerald-500/20 dark:text-emerald-200",
  },
  completed: {
    label: "План завершён",
    className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200",
  },
  deleted: {
    label: "План отклонён",
    className: "bg-red-100 text-red-700 dark:bg-rose-500/20 dark:text-rose-200",
  },
  untracked: {
    label: "Статус неизвестен",
    className: "bg-gray-100 text-gray-600 dark:bg-slate-600/30 dark:text-slate-300",
  },
}

export default function PlanMessage({ plan, plan_id, plan_status, onConfirm, onReject }: PlanMessageProps) {
  const router = useRouter()

  const data: PlanSnapshot = useMemo(() => {
    if (plan && typeof plan === "object") {
      return plan
    }
    return {}
  }, [plan])

  const modules = Array.isArray(data.modules) ? data.modules : []

  const lessons = modules.flatMap((module) =>
    Array.isArray(module.lessons) ? module.lessons : []
  )

  const tasks = lessons.flatMap((lesson) =>
    Array.isArray(lesson.tasks) ? lesson.tasks : []
  )

  const statusInfo = STATUS_META[plan_status ?? "untracked"]
  const canOpenPlan = Boolean(plan_id && (plan_status === "confirmed" || plan_status === "completed"))

  const previewModules = modules.slice(0, 2)
  const remainingModules = modules.length - previewModules.length

  const openPlan = () => {
    if (!canOpenPlan || !plan_id) return
    router.push(`/dashboard/learning/${plan_id}`)
  }

  const planTitle = data.title?.trim() ? data.title : "План обучения"
  const planDescription = data.description?.trim() ? data.description : "Описание отсутствует"

  return (
    <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-4 text-slate-900 shadow-md transition-colors dark:border-slate-800/60 dark:bg-slate-900/70 dark:text-slate-100 dark:shadow-slate-950/40">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 transition-colors dark:text-slate-100">📋 {planTitle}</h3>
          <p className="mt-1 whitespace-pre-line text-sm text-gray-600 transition-colors dark:text-slate-300">
            {planDescription}
          </p>
        </div>
        <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", statusInfo.className)}>
          {statusInfo.label}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-600 transition-colors dark:text-slate-300">
        <span className="rounded-full bg-gray-100 px-2 py-1 transition-colors dark:bg-slate-700/40">Модулей: {modules.length}</span>
        <span className="rounded-full bg-gray-100 px-2 py-1 transition-colors dark:bg-slate-700/40">Уроков: {lessons.length}</span>
        <span className="rounded-full bg-gray-100 px-2 py-1 transition-colors dark:bg-slate-700/40">Заданий: {tasks.length}</span>
        {plan_id && (
          <span className="font-mono text-[11px] text-gray-400 transition-colors dark:text-slate-500">ID: {plan_id}</span>
        )}
      </div>

      <div className="mt-4 space-y-3">
        {previewModules.map((module, moduleIndex) => {
          const moduleLessons = Array.isArray(module.lessons) ? module.lessons : []
          const previewLessons = moduleLessons.slice(0, 3)
          const remainingLessons = moduleLessons.length - previewLessons.length

          return (
            <div
              key={module.id ?? `module-${moduleIndex}`}
              className="rounded-lg border border-gray-100 bg-gray-50/60 p-3 transition-colors dark:border-slate-700/60 dark:bg-slate-800/50"
            >
              <p className="text-sm font-semibold text-gray-900 transition-colors dark:text-slate-100">
                Модуль {moduleIndex + 1}. {module.title || "Без названия"}
              </p>
              {module.description && (
                <p className="mt-1 text-xs text-gray-600 transition-colors dark:text-slate-300">{module.description}</p>
              )}

              {previewLessons.length > 0 && (
                <ul className="mt-2 space-y-1 text-xs text-gray-600 transition-colors dark:text-slate-300">
                  {previewLessons.map((lesson, lessonIndex) => (
                    <li key={lesson.id ?? `lesson-${moduleIndex}-${lessonIndex}`} className="flex items-center gap-2">
                      <span className="text-gray-400 transition-colors dark:text-slate-500">•</span>
                      <span>
                        {lesson.title || "Урок"}
                        {lesson.type && (
                          <span className="ml-1 text-[11px] uppercase tracking-wide text-gray-400 transition-colors dark:text-slate-500">
                            {lesson.type}
                          </span>
                        )}
                      </span>
                    </li>
                  ))}
                  {remainingLessons > 0 && (
                    <li className="text-gray-400 transition-colors dark:text-slate-500">+ ещё {remainingLessons} урок(ов)</li>
                  )}
                </ul>
              )}
            </div>
          )
        })}

        {remainingModules > 0 && (
          <p className="text-xs text-gray-500 transition-colors dark:text-slate-400">+ ещё {remainingModules} модулей в этом плане</p>
        )}
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={openPlan}
          disabled={!canOpenPlan}
          className={cn(
            "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition",
            canOpenPlan
              ? "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400"
              : "cursor-not-allowed bg-blue-100 text-blue-300 dark:bg-blue-500/10 dark:text-blue-300/60",
          )}
        >
          {canOpenPlan
            ? plan_status === "completed"
              ? "Просмотреть план"
              : "Открыть план"
            : "Ожидает подтверждения"}
        </button>

        {plan_status === "active" && (onConfirm || onReject) && (
          <div className="flex gap-2">
            {onConfirm && (
              <button
                type="button"
                onClick={onConfirm}
                className="rounded-lg bg-green-500 px-3 py-2 text-sm font-semibold text-white hover:bg-green-600"
              >
                Принять
              </button>
            )}
            {onReject && (
              <button
                type="button"
                onClick={onReject}
                className="rounded-lg bg-red-500 px-3 py-2 text-sm font-semibold text-white hover:bg-red-600"
              >
                Отклонить
              </button>
            )}
          </div>
        )}

        {plan_status === "confirmed" && (
          <span className="text-sm font-medium text-green-600 transition-colors dark:text-emerald-300">План подтверждён</span>
        )}

        {plan_status === "deleted" && (
          <span className="text-sm font-medium text-red-600 transition-colors dark:text-rose-300">План отклонён</span>
        )}

        {!canOpenPlan && plan_status !== "deleted" && (
          <span className="text-xs text-gray-500 transition-colors dark:text-slate-400">
            План станет доступен в обучении после подтверждения.
          </span>
        )}
      </div>
    </div>
  )
}
