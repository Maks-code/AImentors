"use client"

import { Fragment, useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { Dialog, Transition } from "@headlessui/react"
import { useRouter } from "next/navigation"

import LogoLoader from "@/components/LogoLoader"
import { isAuthenticated } from "@/lib/auth"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"
const DEFAULT_WELCOME_PROMPT =
  "Привет! Ты мой новый наставник. Подскажи, что тебе нужно узнать обо мне, чтобы помочь с обучением."

interface Mentor {
  id: string
  name: string
  subject?: string | null
  description?: string | null
  avatar_url?: string | null
  category?: string | null
  last_interaction?: string | null
}

export function MentorsShowcase() {
  const [mentors, setMentors] = useState<Mentor[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null)
  const router = useRouter()

  useEffect(() => {
    const controller = new AbortController()

    const fetchMentors = async () => {
      try {
        const res = await fetch(`${API_BASE}/mentors`, {
          signal: controller.signal,
        })
        if (!res.ok) {
          throw new Error("Не удалось загрузить список менторов")
        }
        const data: Mentor[] = await res.json()
        setMentors(data)
      } catch (err) {
        if (!(err instanceof DOMException && err.name === "AbortError")) {
          console.error("Ошибка загрузки менторов", err)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchMentors()

    return () => controller.abort()
  }, [])

  const orderedMentors = useMemo(() => {
    return mentors
      .filter((mentor) => mentor)
      .sort((a, b) => {
        const orderA = (a as any)?.order_index ?? 0
        const orderB = (b as any)?.order_index ?? 0
        return orderA - orderB
      })
  }, [mentors])

  const handleStartChat = async (mentor: Mentor) => {
    if (typeof window === "undefined") return

    if (isAuthenticated()) {
      const token = localStorage.getItem("access_token")
      if (!token) {
        router.push("/auth?mode=register")
        return
      }

      try {
        const response = await fetch(`${API_BASE}/chat/send`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            mentor_id: mentor.id,
            prompt: DEFAULT_WELCOME_PROMPT,
          }),
        })

        const payload = await response.json().catch(() => null)
        if (!response.ok) {
          const detail = typeof payload?.detail === "string" ? payload.detail : "Не удалось запустить чат"
          throw new Error(detail)
        }
      } catch (error) {
        console.error("Ошибка запуска чата", error)
        alert(error instanceof Error ? error.message : "Не удалось запустить чат")
        return
      }

      try {
        sessionStorage.setItem(
          "pending_mentor_chat",
          JSON.stringify({
            id: mentor.id,
            name: mentor.name,
            subject: mentor.subject,
            description: mentor.description,
            avatar_url: mentor.avatar_url,
            category: mentor.category ?? "AI наставник",
            last_interaction: new Date().toISOString(),
          })
        )
      } catch (error) {
        console.error("Не удалось сохранить данные наставника", error)
      }
      router.push(`/dashboard/chats?selected=${mentor.id}`)
    } else {
      router.push("/auth?mode=register")
    }
  }

  return (
    <section
      id="mentors"
      className="relative overflow-hidden bg-[radial-gradient(circle_at_0%_20%,rgba(148,163,184,0.18),transparent_55%),radial-gradient(circle_at_95%_15%,rgba(129,140,248,0.2),transparent_45%),linear-gradient(120deg,#f8fafc,#f1f5f9,#f8fafc)] py-20"
    >
      <div className="absolute -top-24 left-[12%] h-72 w-72 rounded-full bg-sky-100/60 blur-3xl" />
      <div className="absolute bottom-[-25%] right-[8%] h-96 w-96 rounded-full bg-indigo-100/60 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-4 text-slate-900 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">
            Наставники
          </span>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
            Выберите эксперта, который будет рядом
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-slate-500 sm:text-base">
            Каталог открытых наставников доступен без авторизации. Посмотрите профили и узнайте, кто поможет вам быстрее достичь цели.
          </p>
        </div>

        {loading ? (
          <div className="mt-12 flex flex-col items-center gap-4 text-slate-500">
            <LogoLoader size={72} />
            <p className="text-sm font-medium">Загружаем наставников…</p>
          </div>
        ) : orderedMentors.length ? (
          <div className="mt-14 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {orderedMentors.map((mentor) => (
              <button
                key={mentor.id}
                onClick={() => setSelectedMentor(mentor)}
                className="group flex h-full flex-col gap-4 rounded-3xl border border-white/70 bg-white/85 p-6 text-left shadow-lg shadow-slate-200/60 backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-2xl"
              >
                <div className="flex items-start gap-4">
                  <div className="h-16 w-16 overflow-hidden rounded-2xl bg-slate-100 shadow-inner shadow-white">
                    <Image
                      src={mentor.avatar_url ? `/${mentor.avatar_url}` : "/default-avatar.png"}
                      alt={mentor.name}
                      width={64}
                      height={64}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                        {mentor.category ?? "AI Наставник"}
                      </p>
                      <h3 className="text-lg font-semibold text-slate-900">{mentor.name}</h3>
                    </div>
                    {mentor.subject && (
                      <span className="inline-flex items-center gap-2 rounded-full bg-sky-100/80 px-3 py-1 text-xs font-medium text-sky-600">
                        {mentor.subject}
                      </span>
                    )}
                  </div>
                </div>
                {mentor.description && (
                  <p className="line-clamp-3 text-sm text-slate-600">
                    {mentor.description}
                  </p>
                )}
                <span className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white/90 px-4 py-2 text-xs font-semibold text-slate-600 transition group-hover:border-sky-200 group-hover:text-sky-600">
                  Открыть профиль
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="mt-12 rounded-3xl border border-dashed border-slate-200 bg-white/80 p-10 text-center text-sm text-slate-500">
            Похоже, пока наставники не опубликованы. Загляните чуть позже — мы готовим обновления.
          </div>
        )}
      </div>

      <Transition show={!!selectedMentor} as={Fragment}>
        <Dialog onClose={() => setSelectedMentor(null)} className="relative z-50">
          <Transition.Child
            as={Fragment}
            enter="duration-200 ease-out"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="duration-150 ease-in"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur" />
          </Transition.Child>

          <div className="fixed inset-0 flex items-center justify-center px-4 py-6">
            <Transition.Child
              as={Fragment}
              enter="duration-200 ease-out"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="duration-150 ease-in"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-white/60 bg-white/85 p-6 text-slate-900 shadow-2xl shadow-slate-200/70 backdrop-blur-xl sm:p-8">
                {selectedMentor && (
                  <div className="relative grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
                    <div className="flex flex-col items-center gap-4">
                      <div className="h-36 w-36 overflow-hidden rounded-3xl bg-slate-100 shadow-lg shadow-slate-200/60">
                        <Image
                          src={selectedMentor.avatar_url ? `/${selectedMentor.avatar_url}` : "/default-avatar.png"}
                          alt={selectedMentor.name}
                          width={144}
                          height={144}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="space-y-2 text-center">
                        <Dialog.Title className="text-2xl font-semibold text-slate-900">
                          {selectedMentor.name}
                        </Dialog.Title>
                        <span className="inline-flex items-center gap-2 rounded-full bg-sky-100/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-sky-600">
                          {selectedMentor.subject ?? "AI наставник"}
                        </span>
                        <p className="text-xs text-slate-400">
                          {selectedMentor.category ?? "Эксперт платформы AI Mentors"}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-5">
                      {selectedMentor.description && (
                        <div className="rounded-2xl border border-white/70 bg-white/70 px-4 py-3 text-sm text-slate-600 shadow-inner shadow-white">
                          {selectedMentor.description}
                        </div>
                      )}

                      <div className="grid gap-3 text-xs text-slate-500 sm:grid-cols-2">
                        <div className="rounded-2xl border border-slate-200 bg-white/85 px-3 py-2 shadow-inner shadow-white">
                          <p className="font-semibold text-slate-700">Формат общения</p>
                          <p>Чаты, созвоны и проверка домашних заданий по запросу.</p>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-white/85 px-3 py-2 shadow-inner shadow-white">
                          <p className="font-semibold text-slate-700">Для кого</p>
                          <p>Специалисты уровня junior–middle, которым нужен постоянный фидбек.</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          onClick={() => handleStartChat(selectedMentor)}
                          className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-sky-300 via-indigo-300 to-violet-300 px-5 py-2 text-sm font-semibold text-slate-900 shadow-lg shadow-sky-100/70 transition hover:-translate-y-0.5"
                        >
                          Начать чат
                        </button>
                        <button
                          onClick={() => setSelectedMentor(null)}
                          className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white/80 px-5 py-2 text-sm font-semibold text-slate-500 shadow-sm transition hover:-translate-y-0.5"
                        >
                          Закрыть
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </section>
  )
}
