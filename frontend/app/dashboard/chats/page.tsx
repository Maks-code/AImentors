"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Sidebar, { SidebarMentor } from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import LogoLoader from "@/components/LogoLoader";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const normalizeMentor = (mentor: any): SidebarMentor => ({
  id: mentor.id,
  name: mentor.name,
  subject: mentor.subject ?? "",
  description: mentor.description ?? "",
  avatar_url: mentor.avatar_url ?? undefined,
  category: mentor.category ?? "",
  last_interaction: mentor.last_interaction ?? null,
});

export default function ChatPage() {
  const [mentors, setMentors] = useState<SidebarMentor[]>([]);
  const [selectedMentorId, setSelectedMentorId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const replaceSelectedParam = (value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set("selected", value);
    } else {
      params.delete("selected");
    }

    const query = params.toString();
    router.replace(`${pathname}${query ? `?${query}` : ""}`, { scroll: false });
  };

  useEffect(() => {
    const fetchMentors = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/chat/history`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const raw = await res.json();
        let nextMentors: SidebarMentor[] = Array.isArray(raw) ? raw.map(normalizeMentor) : [];
        let pendingId: string | null = null;

        if (typeof window !== "undefined") {
          const pendingRaw = sessionStorage.getItem("pending_mentor_chat");
          if (pendingRaw) {
            try {
              const pending: SidebarMentor = JSON.parse(pendingRaw);
              const normalizedPending = normalizeMentor({
                ...pending,
                category: pending.category ?? "AI наставник",
              });

              if (!nextMentors.some((m) => m.id === normalizedPending.id)) {
                nextMentors = [...nextMentors, normalizedPending];
              }
              pendingId = normalizedPending.id;
            } catch (err) {
              console.error("Не удалось распарсить данные наставника", err);
            }
            sessionStorage.removeItem("pending_mentor_chat");
          }
        }

        const sortedMentors = [...nextMentors].sort((a, b) => {
          const timeA = a.last_interaction ? new Date(a.last_interaction).getTime() : 0;
          const timeB = b.last_interaction ? new Date(b.last_interaction).getTime() : 0;
          return timeB - timeA;
        });

        setMentors(sortedMentors);

        const selectedFromURL = searchParams.get("selected");
        const fallbackSelected = sortedMentors.length ? sortedMentors[0].id : null;
        const currentSelected = selectedMentorId;

        const targetId =
          selectedFromURL ||
          pendingId ||
          (currentSelected && sortedMentors.some((mentor) => mentor.id === currentSelected)
            ? currentSelected
            : null) ||
          fallbackSelected;

        if (targetId && targetId !== selectedMentorId) {
          setSelectedMentorId(targetId);
        }
      } catch (err) {
        console.error("Ошибка загрузки списка менторов", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMentors();
  }, [searchParams]);

  const handleDeleteMentor = (mentorId: string) => {
    setMentors((prevMentors) => {
      const updated = prevMentors.filter((mentor) => mentor.id !== mentorId);

      setSelectedMentorId((prev) => {
        if (prev !== mentorId) return prev;

        const fallback = updated[0]?.id ?? null;
        replaceSelectedParam(fallback);
        return fallback;
      });

      return updated;
    });
  };

  const handleSelectMentor = (mentorId: string) => {
    setSelectedMentorId(mentorId);
    replaceSelectedParam(mentorId);
  };

  const selectedMentor = useMemo(
    () => mentors.find((mentor) => mentor.id === selectedMentorId) || null,
    [mentors, selectedMentorId]
  );

  if (loading) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 text-slate-500 dark:text-slate-400 transition-colors dark:text-slate-300">
        <LogoLoader size={80} />
        <p className="text-sm font-medium">Загружаем чаты…</p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-220px)] min-h-[600px] w-full flex-col gap-4 overflow-hidden text-slate-900 transition-colors duration-500 lg:flex-row dark:text-slate-100">
      <div className="flex-none overflow-hidden">
        <Sidebar
          mentors={mentors}
          onSelect={handleSelectMentor}
          onDelete={handleDeleteMentor}
          currentMentorId={selectedMentorId}
        />
      </div>
      <div className="flex h-full min-h-[480px] flex-1 overflow-hidden">
        {selectedMentor ? (
          <ChatWindow selectedMentorId={selectedMentor.id} mentor={selectedMentor} />
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-3d border border-dashed border-slate-200 bg-white/75 p-10 text-center text-sm text-slate-500 shadow-xl shadow-slate-200/60 transition-colors dark:border-slate-700/60 dark:bg-slate-900/60 dark:text-slate-400 dark:shadow-slate-950/50">
            Выберите наставника слева, чтобы продолжить диалог.
          </div>
        )}
      </div>
    </div>
  );
}
