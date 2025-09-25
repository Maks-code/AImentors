"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Circle,
  PlayCircle,
} from "lucide-react";

interface Task {
  id: string;
  question: string;
  type: string;
  answer?: string | null;
  options?: unknown;
  order_index?: number;
}

interface Lesson {
  id: string;
  title: string;
  type: string;
  theory?: string | null;
  content?: unknown;
  tasks: Task[];
  order_index?: number;
  user_progress_status?: string | null;
}

interface Module {
  id: string;
  title: string;
  description?: string | null;
  lessons: Lesson[];
  order_index?: number;
}

interface PlanDetail {
  id: string;
  title: string;
  description?: string | null;
  status?: string;
  created_at?: string;
  mentor_id?: string;
  modules: Module[];
}

function getLessonTheory(lesson: Lesson | undefined): string {
  if (!lesson) return "";

  if (typeof lesson.theory === "string" && lesson.theory.trim()) {
    return lesson.theory;
  }

  if (typeof lesson.content === "string") {
    return lesson.content;
  }

  if (lesson.content && typeof lesson.content === "object") {
    const contentObj = lesson.content as Record<string, unknown>;
    const candidates = [
      contentObj["theory"],
      contentObj["text"],
      contentObj["body"],
      contentObj["description"],
    ];
    for (const value of candidates) {
      if (typeof value === "string" && value.trim()) {
        return value;
      }
    }
  }

  return "Для этого урока пока нет теоретического описания.";
}

const sortModules = (modules: Module[]): Module[] => {
  const orderedModules = [...modules].sort((a, b) => {
    const aIdx = typeof a.order_index === "number" ? a.order_index : 0;
    const bIdx = typeof b.order_index === "number" ? b.order_index : 0;
    return aIdx - bIdx;
  });

  return orderedModules.map((module) => {
    const lessons = Array.isArray(module.lessons) ? [...module.lessons] : [];
    lessons.sort((a, b) => {
      const aIdx = typeof a.order_index === "number" ? a.order_index : 0;
      const bIdx = typeof b.order_index === "number" ? b.order_index : 0;
      return aIdx - bIdx;
    });

    return { ...module, lessons };
  });
};

export default function PlanDetailPage() {
  const params = useParams<{ planId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();

  const planParam = params?.planId;
  const planId = Array.isArray(planParam) ? planParam[0] : planParam;

  const [plan, setPlan] = useState<PlanDetail | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isMarking, setIsMarking] = useState(false);

  useEffect(() => {
    if (!planId) return;

    setIsLoading(true);
    setError(null);

    const token = localStorage.getItem("access_token");
    const headers: HeadersInit = { "Content-Type": "application/json" };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/learning/plans/${planId}`, { headers })
      .then(async (res) => {
        if (!res.ok) {
          let message = "Не удалось получить план";

          if (res.status === 403) {
            message = "План станет доступен после подтверждения. Вернитесь к обучению.";
          } else if (res.status === 404) {
            message = "План не найден";
          }

          const body = await res.json().catch(() => null);
          if (body && typeof body.detail === "string" && body.detail !== "Plan is not confirmed") {
            message = body.detail;
          }

          throw new Error(message);
        }

        return res.json() as Promise<PlanDetail>;
      })
      .then((data) => {
        if (!data || !Array.isArray(data.modules)) {
          throw new Error("План не содержит модулей");
        }

        const orderedPlan: PlanDetail = {
          ...data,
          modules: sortModules(data.modules ?? []),
        };

        setPlan(orderedPlan);

        const preCompleted = orderedPlan.modules
          .flatMap((module) => module.lessons || [])
          .filter((lesson) => lesson.user_progress_status === "completed")
          .map((lesson) => lesson.id);

        setCompletedLessons(preCompleted);

        const lessonFromQuery = searchParams?.get("lesson");
        const allLessons = orderedPlan.modules.flatMap((module) => module.lessons || []);
        const lessonExists = lessonFromQuery && allLessons.some((lesson) => lesson.id === lessonFromQuery);

        setSelectedLessonId(lessonExists ? (lessonFromQuery as string) : allLessons[0]?.id ?? null);
      })
      .catch((err: Error) => {
        setError(err.message);
        setPlan(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [planId, searchParams]);

  const allLessons = useMemo(() => {
    if (!plan) return [] as Lesson[];
    return plan.modules.flatMap((module) => module.lessons || []);
  }, [plan]);

  const selectedLesson = allLessons.find((lesson) => lesson.id === selectedLessonId) ?? null;
  const selectedLessonIndex = selectedLesson ? allLessons.findIndex((lesson) => lesson.id === selectedLesson.id) : -1;

  const planIsCompleted = plan?.status === "completed";
  const isSelectedLessonCompleted = selectedLesson ? completedLessons.includes(selectedLesson.id) : false;

  const completedCount = completedLessons.filter((lessonId) => allLessons.some((lesson) => lesson.id === lessonId)).length;
  const totalLessons = allLessons.length;
  const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  const markLessonCompleted = async () => {
    if (!selectedLesson || completedLessons.includes(selectedLesson.id) || isMarking) return;

    const token = localStorage.getItem("access_token");
    if (!token) {
      alert("Требуется повторная авторизация");
      return;
    }

    setIsMarking(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/learning/progress`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ lesson_id: selectedLesson.id, status: "completed" }),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        const message = payload?.detail || "Не удалось сохранить прогресс";
        throw new Error(message);
      }

      let shouldMarkPlanCompleted = false;

      setCompletedLessons((prev) => {
        if (prev.includes(selectedLesson.id)) return prev;
        const updated = [...prev, selectedLesson.id];
        const total = allLessons.length;
        if (total > 0 && updated.length >= total) {
          shouldMarkPlanCompleted = true;
        }
        return updated;
      });

      if (shouldMarkPlanCompleted) {
        setPlan((prev) => (prev ? { ...prev, status: "completed" } : prev));
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Неизвестная ошибка";
      alert(message);
    } finally {
      setIsMarking(false);
    }
  };

  const goToLessonByOffset = (offset: number) => {
    if (selectedLessonIndex === -1) return;
    const nextIndex = selectedLessonIndex + offset;
    if (nextIndex < 0 || nextIndex >= allLessons.length) return;
    setSelectedLessonId(allLessons[nextIndex].id);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 text-slate-500">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-sky-200 border-t-indigo-400" />
        <span className="text-sm font-medium">Загружаем план обучения…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-dashed border-rose-200 bg-rose-50/80 p-8 text-center text-rose-500">
        <button
          onClick={() => router.push("/dashboard/learning")}
          className="mb-4 inline-flex items-center rounded-full bg-white px-4 py-2 text-sm font-semibold text-rose-500 shadow-sm shadow-rose-100 transition hover:-translate-y-0.5"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Вернуться к обучению
        </button>
        <p className="text-sm font-medium">{error}</p>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-200 bg-white/80 p-8 text-center text-slate-500">
        <button
          onClick={() => router.push("/dashboard/learning")}
          className="mb-4 inline-flex items-center rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm shadow-slate-100 transition hover:-translate-y-0.5"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Вернуться к обучению
        </button>
        <p className="text-sm">План не найден или у него пока нет модулей.</p>
      </div>
    );
  }

  const planCreatedAt = plan.created_at ? new Date(plan.created_at).toLocaleDateString() : null;

  const handleDeletePlan = async () => {
    if (!planId) return;

    const shouldDelete = window.confirm("Удалить этот план обучения? Его уроки и прогресс будут недоступны.");
    if (!shouldDelete) return;

    setIsDeleting(true);

    const token = localStorage.getItem("access_token");
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/learning/plans/${planId}`, {
        method: "DELETE",
        headers,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const message = body?.detail || "Не удалось удалить план";
        throw new Error(message);
      }

      router.push("/dashboard/learning");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Неизвестная ошибка при удалении плана";
      alert(message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="overflow-hidden rounded-3xl border border-white/60 bg-white/75 shadow-xl shadow-slate-200/70 backdrop-blur-xl">
        <div className="relative gap-6 px-6 py-7 md:flex md:items-center md:justify-between lg:px-10">
          <div className="absolute -top-16 left-8 h-32 w-32 rounded-full bg-sky-100 blur-3xl" />
          <div className="absolute -bottom-16 right-6 h-36 w-36 rounded-full bg-indigo-100 blur-3xl" />
          <div className="relative flex items-start gap-4">
            <button
              onClick={() => router.push("/dashboard/learning")}
              className="inline-flex items-center rounded-full border border-slate-200 bg-white/90 px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm shadow-slate-200 transition hover:-translate-y-0.5"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Назад к планам
            </button>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
                <BookOpen className="h-4 w-4 text-sky-400" />
                {planCreatedAt ? `Создан ${planCreatedAt}` : "План обучения"}
              </div>
              <h1 className="text-3xl font-semibold text-slate-900 md:text-4xl">{plan.title}</h1>
              <span
                className={`inline-flex items-center gap-2 rounded-full px-4 py-1 text-xs font-semibold ${
                  planIsCompleted ? "bg-emerald-100 text-emerald-600" : "bg-sky-100 text-sky-600"
                }`}
              >
                <span className="inline-block h-2 w-2 rounded-full bg-current" />
                {planIsCompleted ? "План завершён" : "План подтверждён"}
              </span>
              {plan.description && (
                <p className="max-w-2xl text-sm text-slate-500">{plan.description}</p>
              )}
            </div>
          </div>
          <div className="relative mt-6 flex w-full max-w-sm flex-col gap-3 md:mt-0">
            <div>
              <div className="flex items-center justify-between text-sm text-slate-500">
                <span>Прогресс</span>
                <span className="font-semibold text-slate-700">{progressPercent}%</span>
              </div>
              <div className="mt-1 h-2 rounded-full bg-slate-100">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-sky-300 via-indigo-300 to-violet-300 transition-all"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Завершено уроков: <span className="font-medium text-slate-600">{completedCount}</span> из {totalLessons}
              </p>
            </div>
            <button
              onClick={handleDeletePlan}
              disabled={isDeleting}
              className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                isDeleting
                  ? "cursor-not-allowed bg-rose-100 text-rose-300"
                  : "bg-gradient-to-r from-rose-200 to-rose-300 text-rose-700 shadow-lg shadow-rose-100/50 hover:-translate-y-0.5"
              }`}
            >
              {isDeleting ? "Удаляем…" : "Удалить план"}
            </button>
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="hidden flex-col overflow-hidden rounded-3xl border border-white/60 bg-white/80 p-5 shadow-xl shadow-slate-200/60 backdrop-blur-xl lg:flex">
          <h2 className="text-lg font-semibold text-slate-900">Модули курса</h2>
          <p className="mt-1 text-xs text-slate-500">Выберите урок, чтобы перейти к материалу.</p>

          <div className="mt-4 flex-1 space-y-5 overflow-y-auto pr-2">
            {plan.modules.length === 0 && (
              <p className="text-sm text-slate-500">Модули пока не добавлены.</p>
            )}

            {plan.modules.map((module, moduleIndex) => {
              const moduleLessons = module.lessons || [];
              const moduleCompleted = moduleLessons.filter((lesson) => completedLessons.includes(lesson.id)).length;

              return (
                <div key={module.id} className="space-y-2 rounded-2xl bg-slate-50/80 p-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Модуль {moduleIndex + 1}. {module.title}
                    </p>
                    {module.description && (
                      <p className="text-xs text-slate-500">{module.description}</p>
                    )}
                    <p className="text-xs text-slate-400">
                      {moduleCompleted} из {moduleLessons.length} уроков выполнено
                    </p>
                  </div>

                  <ul className="space-y-1">
                    {moduleLessons.map((lesson, lessonIndex) => {
                      const isActive = lesson.id === selectedLessonId;
                      const isCompleted = completedLessons.includes(lesson.id);

                      return (
                        <li key={lesson.id}>
                          <button
                            onClick={() => setSelectedLessonId(lesson.id)}
                            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition-all ${
                              isActive
                                ? "border border-sky-200 bg-sky-50 text-sky-700 shadow-sm"
                                : "text-slate-600 hover:bg-white"
                            }`}
                          >
                            <span className="flex h-6 w-6 items-center justify-center rounded-full border text-xs font-semibold">
                              {isCompleted ? (
                                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                              ) : (
                                <span>{lessonIndex + 1}</span>
                              )}
                            </span>
                            <span className="flex-1">
                              <span className="block font-medium text-slate-800">{lesson.title}</span>
                              <span className="text-xs text-slate-400">
                                {lesson.type === "practical" ? "Практика" : "Теория"}
                              </span>
                            </span>
                            <ChevronRight className={`h-4 w-4 ${isActive ? "text-sky-500" : "text-slate-300"}`} />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        </aside>

        <main className="overflow-hidden rounded-3xl border border-white/60 bg-white/75 p-6 shadow-xl shadow-slate-200/70 backdrop-blur-xl">
          <div className="mb-4 space-y-3 lg:hidden">
            <h2 className="text-base font-semibold text-slate-900">Содержание курса</h2>
            {plan.modules.map((module, moduleIndex) => {
              const moduleLessons = module.lessons || [];
              return (
                <div key={module.id} className="rounded-xl border border-slate-200 bg-slate-50/80 p-3">
                  <p className="text-sm font-semibold text-slate-800">
                    Модуль {moduleIndex + 1}. {module.title}
                  </p>
                  <ul className="mt-2 space-y-1">
                    {moduleLessons.map((lesson) => {
                      const isActive = lesson.id === selectedLessonId;
                      const isCompleted = completedLessons.includes(lesson.id);
                      const lessonNumber = (lesson.order_index ?? 0) + 1;

                      return (
                        <li key={lesson.id}>
                          <button
                            onClick={() => setSelectedLessonId(lesson.id)}
                            className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition ${
                              isActive ? "bg-sky-50 text-sky-700" : "text-slate-600 hover:bg-white"
                            }`}
                          >
                            <span className="flex h-6 w-6 items-center justify-center rounded-full border text-xs font-semibold">
                              {isCompleted ? (
                                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                              ) : (
                                <span>{lessonNumber}</span>
                              )}
                            </span>
                            <span className="flex-1">
                              <span className="block font-medium">{lesson.title}</span>
                              <span className="text-xs text-slate-400">
                                {lesson.type === "practical" ? "Практика" : "Теория"}
                              </span>
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>

          {!selectedLesson ? (
            <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 p-10 text-center text-sm text-slate-500">
              Выберите урок в списке модулей слева, чтобы изучить материал.
            </div>
          ) : (
            <div className="flex h-full flex-col">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Урок {selectedLessonIndex + 1}</p>
                  <h2 className="text-2xl font-semibold text-slate-900">{selectedLesson.title}</h2>
                  <p className="mt-1 inline-flex items-center text-sm text-slate-500">
                    <PlayCircle className="mr-2 h-4 w-4 text-sky-400" />
                    Тип урока: {selectedLesson.type === "practical" ? "Практическое занятие" : "Теоретический материал"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">Статус урока</p>
                  <p className="flex items-center justify-end gap-2 text-sm font-medium text-slate-700">
                    {completedLessons.includes(selectedLesson.id) ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Завершён
                      </>
                    ) : (
                      <>
                        <Circle className="h-4 w-4 text-slate-300" /> В процессе
                      </>
                    )}
                  </p>
                </div>
              </div>

              <section className="mt-6 space-y-5">
                <div className="rounded-2xl bg-sky-50/80 p-5">
                  <h3 className="text-lg font-semibold text-slate-900">Теория</h3>
                  <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-600">
                    {getLessonTheory(selectedLesson)}
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-slate-900">Задания</h3>
                  {(!selectedLesson.tasks || selectedLesson.tasks.length === 0) && (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 p-4 text-sm text-slate-500">
                      Для этого урока пока нет заданий от ментора.
                    </div>
                  )}

                  {selectedLesson.tasks?.map((task, index) => {
                    const taskOptions = task.options;
                    let renderedOptions: JSX.Element | null = null;

                    if (Array.isArray(taskOptions) && taskOptions.length > 0) {
                      renderedOptions = (
                        <ul className="ml-5 list-disc space-y-1 text-sm text-slate-600">
                          {taskOptions.map((option, optionIndex) => (
                            <li key={optionIndex}>{String(option)}</li>
                          ))}
                        </ul>
                      );
                    } else if (taskOptions && typeof taskOptions === "object") {
                      const entries = Object.entries(taskOptions as Record<string, unknown>);
                      if (entries.length > 0) {
                        renderedOptions = (
                          <ul className="ml-5 list-disc space-y-1 text-sm text-slate-600">
                            {entries.map(([key, value]) => (
                              <li key={key}>
                                <span className="font-medium">{key}:</span> {String(value)}
                              </li>
                            ))}
                          </ul>
                        );
                      }
                    }

                    return (
                      <div key={task.id ?? index} className="rounded-2xl border border-slate-100 bg-white/90 p-4 shadow-sm">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-sm font-medium text-slate-900">
                              Вопрос {index + 1}: {task.question}
                            </p>
                            <p className="mt-1 text-xs text-slate-400">Тип задания: {task.type}</p>
                          </div>
                        </div>

                        {renderedOptions}

                        {task.answer && (
                          <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-500">
                            Ответ ментора: <span className="font-medium text-slate-700">{task.answer}</span>
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>

              <div className="mt-auto flex flex-col gap-3 border-t border-slate-100 pt-6 md:flex-row md:items-center md:justify-between">
                <div className="flex gap-3">
                  <button
                    onClick={() => goToLessonByOffset(-1)}
                    disabled={selectedLessonIndex <= 0}
                    className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-medium transition ${
                      selectedLessonIndex <= 0
                        ? "cursor-not-allowed border border-slate-100 bg-slate-50 text-slate-300"
                        : "border border-slate-200 bg-white text-slate-600 shadow-sm hover:-translate-y-0.5"
                    }`}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Предыдущий урок
                  </button>
                  <button
                    onClick={() => goToLessonByOffset(1)}
                    disabled={selectedLessonIndex >= allLessons.length - 1}
                    className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold transition ${
                      selectedLessonIndex >= allLessons.length - 1
                        ? "cursor-not-allowed border border-slate-100 bg-slate-50 text-slate-300"
                        : "bg-gradient-to-r from-sky-300 via-indigo-300 to-violet-300 text-slate-900 shadow-lg shadow-sky-100/70 hover:-translate-y-0.5"
                    }`}
                  >
                    Следующий урок <ChevronRight className="ml-2 h-4 w-4" />
                  </button>
                </div>

                <button
                  onClick={markLessonCompleted}
                  disabled={!selectedLesson || isSelectedLessonCompleted || isMarking || planIsCompleted}
                  className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition ${
                    !selectedLesson || isSelectedLessonCompleted || planIsCompleted
                      ? "cursor-not-allowed bg-emerald-100 text-emerald-300"
                      : "bg-emerald-400 text-emerald-900 shadow-lg shadow-emerald-100/70 hover:-translate-y-0.5"
                  }`}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  {planIsCompleted
                    ? "План завершён"
                    : isSelectedLessonCompleted
                    ? "Урок выполнен"
                    : isMarking
                    ? "Сохраняем..."
                    : "Отметить выполненным"}
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
