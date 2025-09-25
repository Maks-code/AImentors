"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

interface PlanCard {
  id: string;
  title: string;
  description?: string | null;
  status?: string;
  created_at?: string;
  modules?: Array<{ lessons?: Array<unknown> }>;
}

export default function LearningPage() {
  const [plans, setPlans] = useState<PlanCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/learning/plans`, { headers })
      .then((res) => res.json())
      .then((data) => {
        let rawPlans: PlanCard[] = [];

        if (Array.isArray(data)) {
          rawPlans = data;
        } else if (Array.isArray(data?.plans)) {
          rawPlans = data.plans;
        }

        const visiblePlans = rawPlans.filter((plan) =>
          plan.status === "confirmed" || plan.status === "completed"
        );
        setPlans(visiblePlans);
      })
      .catch(() => setPlans([]))
      .finally(() => setIsLoading(false));
  }, []);

  const handleOpenPlan = (planId: string) => {
    router.push(`/dashboard/learning/${planId}`);
  };

  const plansWithMeta = useMemo(() => {
    return plans.map((plan) => {
      const lessonsCount = plan.modules?.reduce((acc, module) => {
        const moduleLessons = Array.isArray(module?.lessons) ? module.lessons.length : 0;
        return acc + moduleLessons;
      }, 0) ?? 0;

      return {
        ...plan,
        lessonsCount,
        isCompleted: plan.status === "completed",
      };
    });
  }, [plans]);

  const inProgressPlans = useMemo(
    () => plansWithMeta.filter((plan) => !plan.isCompleted),
    [plansWithMeta]
  );

  const completedPlans = useMemo(
    () => plansWithMeta.filter((plan) => plan.isCompleted),
    [plansWithMeta]
  );

  if (isLoading) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-sky-200 border-t-sky-500" />
        <span className="text-sm font-medium text-slate-500">Загружаем ваши планы обучения…</span>
      </div>
    );
  }

  if (!plansWithMeta.length) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-200 bg-white/80 p-8 text-center shadow-lg shadow-slate-200/60">
        <h1 className="text-2xl font-semibold text-slate-900">Пока нет подтверждённых планов</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-slate-500">
          Запросите план у наставника в чате. Как только вы примете предложение, оно сразу появится в разделе обучения и будет готово к прохождению.
        </p>
        <button
          onClick={() => router.push("/dashboard/chats")}
          className="mt-6 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-sky-300 to-indigo-300 px-6 py-2 text-sm font-semibold text-slate-900 shadow-lg shadow-sky-100/70 transition-all duration-200 hover:-translate-y-0.5"
        >
          Перейти в чаты
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Раздел обучения</h1>
        <p className="text-gray-600 mt-2 max-w-2xl">
          Здесь собраны все подтверждённые планы. Завершённые программы отображаются отдельно, чтобы вам было проще ориентироваться в прогрессе.
        </p>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">В процессе</h2>
          <span className="text-sm text-slate-400">{inProgressPlans.length} план(ов)</span>
        </div>
        {inProgressPlans.length ? (
          <div className="grid gap-4 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1">
            {inProgressPlans.map((plan) => (
              <div
                key={plan.id}
                className="relative flex flex-col overflow-hidden rounded-2xl border border-white/60 bg-white/80 p-5 shadow-lg shadow-slate-200/70 transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl hover:shadow-sky-100/70"
              >
                <span className="absolute inset-x-6 top-0 h-1 rounded-b-full bg-gradient-to-r from-sky-300 via-indigo-300 to-violet-300" />
                <div className="mt-3 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-semibold text-slate-900">{plan.title}</h3>
                    <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-600">В процессе</span>
                  </div>
                  {plan.description && (
                    <p className="text-sm text-slate-500 line-clamp-3">{plan.description}</p>
                  )}
                </div>

                <div className="mt-auto space-y-1 text-sm text-slate-500">
                  {plan.created_at && (
                    <p>Создан: <span className="font-medium text-slate-600">{new Date(plan.created_at).toLocaleDateString()}</span></p>
                  )}
                  <p>
                    Уроков: <span className="font-medium text-slate-600">{plan.lessonsCount}</span>
                  </p>
                </div>

                <button
                  onClick={() => handleOpenPlan(plan.id)}
                  className="mt-5 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-sky-300 to-indigo-300 px-4 py-2 text-sm font-semibold text-slate-900 shadow-md shadow-sky-100/70 transition-all duration-200 hover:-translate-y-0.5"
                >
                  Продолжить обучение
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 p-6 text-sm text-slate-500">
            Пока нет активных планов. Подтвердите новый план в чате, чтобы он появился в этом списке.
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">Завершённые</h2>
          <span className="text-sm text-slate-400">{completedPlans.length} план(ов)</span>
        </div>
        {completedPlans.length ? (
          <div className="grid gap-4 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1">
            {completedPlans.map((plan) => (
              <div
                key={plan.id}
                className="relative flex flex-col overflow-hidden rounded-2xl border border-white/60 bg-white/85 p-5 shadow-lg shadow-slate-200/70 transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-100/70"
              >
                <span className="absolute inset-x-6 top-0 h-1 rounded-b-full bg-gradient-to-r from-emerald-300 via-sky-200 to-indigo-200" />
                <div className="mt-3 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-semibold text-slate-900">{plan.title}</h3>
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-600">Завершён</span>
                  </div>
                  {plan.description && (
                    <p className="text-sm text-slate-500 line-clamp-3">{plan.description}</p>
                  )}
                </div>

                <div className="mt-auto space-y-1 text-sm text-slate-500">
                  {plan.created_at && (
                    <p>Создан: <span className="font-medium text-slate-600">{new Date(plan.created_at).toLocaleDateString()}</span></p>
                  )}
                  <p>
                    Уроков: <span className="font-medium text-slate-600">{plan.lessonsCount}</span>
                  </p>
                </div>

                <button
                  onClick={() => handleOpenPlan(plan.id)}
                  className="mt-5 inline-flex items-center justify-center rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm shadow-slate-200 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white"
                >
                  Просмотреть материалы
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 p-6 text-sm text-slate-500">
            Завершённых планов пока нет. Выполните все уроки, чтобы переместить план в эту секцию.
          </div>
        )}
      </section>
    </div>
  );
}
