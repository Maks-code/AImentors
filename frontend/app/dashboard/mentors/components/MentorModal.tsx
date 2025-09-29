// Файл: app/(dashboard)/mentors/components/MentorModal.tsx
"use client";

import Image from "next/image";
import { Dialog } from "@headlessui/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface Mentor {
  id: string;
  name: string;
  subject: string;
  description: string;
  avatar_url?: string;
  category: string;
}

interface MentorModalProps {
  mentor: Mentor;
  onClose: () => void;
}

export default function MentorModal({ mentor, onClose }: MentorModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleStartChat = () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/auth");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      sessionStorage.setItem(
        "pending_mentor_chat",
        JSON.stringify({
          id: mentor.id,
          name: mentor.name,
          subject: mentor.subject,
          description: mentor.description,
          avatar_url: mentor.avatar_url,
          category: mentor.category,
        })
      );
    } catch (err) {
      console.error("Не удалось сохранить данные наставника", err);
    }

    onClose();
    router.push(`/dashboard/chats?selected=${mentor.id}`);
    setLoading(false);
  };

  return (
    <Dialog open={!!mentor} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center px-4 py-6">
        <Dialog.Panel className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-white/50 bg-white/80 p-6 shadow-2xl shadow-slate-200/70 backdrop-blur-xl sm:p-8">
          <div className="absolute -top-16 right-10 h-40 w-40 rounded-full bg-sky-200/40 blur-3xl" />
          <div className="absolute bottom-0 left-10 h-48 w-48 rounded-full bg-indigo-200/35 blur-3xl" />

          <div className="relative grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
            <div className="flex flex-col items-center gap-4">
              <div className="h-36 w-36 overflow-hidden rounded-3xl bg-slate-100 shadow-lg shadow-slate-200/60">
                <Image
                  src={mentor.avatar_url ? `/${mentor.avatar_url}` : "/default-avatar.png"}
                  alt={mentor.name}
                  width={144}
                  height={144}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="space-y-2 text-center">
                <Dialog.Title className="text-2xl font-semibold text-slate-900">
                  {mentor.name}
                </Dialog.Title>
                <span className="inline-flex items-center gap-2 rounded-full bg-sky-100/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-sky-600">
                  {mentor.subject}
                </span>
                <p className="text-xs text-slate-400">Категория: {mentor.category}</p>
              </div>
            </div>

            <div className="space-y-5">
              <div className="rounded-2xl border border-white/70 bg-white/70 px-4 py-3 text-sm text-slate-600 shadow-inner shadow-white">
                {mentor.description}
              </div>

              <div className="grid gap-3 text-xs text-slate-500 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-100 bg-white/80 px-3 py-2 shadow-inner">
                  <p className="font-semibold text-slate-700">Сильные стороны</p>
                  <p>Индивидуальные планы и адаптивные методики.</p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-white/80 px-3 py-2 shadow-inner">
                  <p className="font-semibold text-slate-700">Доступность</p>
                  <p>Отвечает в течение дня и проводит регулярные созвоны.</p>
                </div>
              </div>

              {error && (
                <p className="rounded-2xl bg-rose-100/70 px-4 py-2 text-sm text-rose-600">
                  {error}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleStartChat}
                  disabled={loading}
                  className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-sky-300 via-indigo-300 to-violet-300 px-5 py-2 text-sm font-semibold text-slate-900 shadow-lg shadow-sky-100/70 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Запуск чата…" : "Начать чат"}
                </button>
                <button
                  onClick={onClose}
                  className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white/80 px-5 py-2 text-sm font-semibold text-slate-500 shadow-sm hover:-translate-y-0.5"
                >
                  Закрыть
                </button>
              </div>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
