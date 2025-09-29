// app/dashboard/chats/components/ChatWindow.tsx
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PlanMessage from "./PlanMessage";
import { CheckCircle2, Loader2, Sparkles } from "lucide-react";

interface MentorInfo {
  id: string;
  name: string;
  subject: string;
  description?: string;
  avatar_url?: string;
  category?: string;
}

type PlanTask = {
  id?: string;
  question?: string;
  title?: string;
  type?: string;
};

type PlanLesson = {
  id?: string;
  title?: string;
  type?: string;
  tasks?: PlanTask[] | null;
};

type PlanModule = {
  id?: string;
  title?: string;
  description?: string;
  lessons?: PlanLesson[] | null;
};

type PlanSnapshot = {
  id?: string;
  title?: string;
  description?: string;
  modules?: PlanModule[] | null;
};

type PlanStatus = "active" | "confirmed" | "completed" | "deleted";

interface Message {
  role?: "user" | "assistant";
  content?: string;
  created_at?: string;
  planDraft?: PlanSnapshot | null;
  plan_id?: string;
  plan_snapshot?: PlanSnapshot | null;
  plan_status?: PlanStatus;
}

interface ChatWindowProps {
  selectedMentorId: string;
  mentor: MentorInfo;
}

interface ChatHistoryItem {
  id: string;
  prompt: string;
  response: string;
  created_at: string;
  plan_id?: string | null;
  plan_snapshot?: PlanSnapshot | null;
  plan_status?: PlanStatus | null;
}

interface ChatSendResponse {
  response?: string;
  planDraft?: PlanSnapshot | null;
  plan_id?: string | null;
  plan_status?: PlanStatus | null;
}

const TypingIndicator = () => (
  <div className="flex items-center gap-1 text-xs text-slate-500">
    <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.2s]" />
    <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.1s]" />
    <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" />
  </div>
);

export default function ChatWindow({ selectedMentorId, mentor }: ChatWindowProps) {
  const apiUrl = useMemo(() => process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000", []);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const syncPlanStatus = useCallback(
    async (planId: string) => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) return;

        const res = await fetch(`${apiUrl}/learning/plans/${planId}/status`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          if (res.status === 404) {
            setMessages((prev) =>
              prev.map((m) => (m.plan_id === planId ? { ...m, plan_status: "deleted" } : m))
            );
          }
          return;
        }

        const payload = await res.json();
        const status = (payload?.status as PlanStatus) || "active";

        setMessages((prev) =>
          prev.map((m) => (m.plan_id === planId ? { ...m, plan_status: status } : m))
        );
      } catch (err) {
        console.error("❌ Ошибка синхронизации статуса плана", err);
      }
    },
    [apiUrl]
  );

  const handleConfirm = async (plan_id: string) => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) throw new Error("Необходимо авторизоваться");

      const res = await fetch(`${apiUrl}/learning/plans/${plan_id}/confirm`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData?.message || "Ошибка подтверждения плана");
      }

      setMessages((prev) =>
        prev.map((m) => (m.plan_id === plan_id ? { ...m, plan_status: "confirmed" } : m))
      );
      await syncPlanStatus(plan_id);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Неизвестная ошибка при подтверждении плана");
    }
  };

  const handleReject = async (plan_id: string) => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) throw new Error("Необходимо авторизоваться");

      const res = await fetch(`${apiUrl}/learning/plans/${plan_id}/reject`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData?.message || "Ошибка отклонения плана");
      }

      setMessages((prev) =>
        prev.map((m) => (m.plan_id === plan_id ? { ...m, plan_status: "deleted" } : m))
      );
      await syncPlanStatus(plan_id);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Неизвестная ошибка при отклонении плана");
    }
  };

  useEffect(() => {
    const fetchHistory = async (limit = 50, offset = 0) => {
      setHistoryLoading(true);
      setError(null);

      const token = localStorage.getItem("access_token");
      if (!token) {
        setHistoryLoading(false);
        return;
      }

      try {
        const res = await fetch(
          `${apiUrl}/chat/history/${selectedMentorId}?limit=${limit}&offset=${offset}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const data: unknown = await res.json();
        const history: ChatHistoryItem[] = Array.isArray(data) ? (data as ChatHistoryItem[]) : [];

        const formatted: Message[] = history.flatMap((item) => {
          const userMessage: Message = {
            role: "user",
            content: item.prompt,
            created_at: item.created_at,
          };

          const assistantMessage: Message = item.plan_snapshot
            ? {
                role: "assistant",
                content: item.response,
                created_at: item.created_at,
                plan_snapshot: item.plan_snapshot,
                plan_id: item.plan_id ?? undefined,
                plan_status: item.plan_status ?? undefined,
              }
            : {
                role: "assistant",
                content: item.response,
                created_at: item.created_at,
              };

          return [userMessage, assistantMessage];
        });

        setMessages(formatted);

        const plansToSync = formatted
          .filter((m) => m.plan_id && !m.plan_status)
          .map((m) => m.plan_id!);

        for (const pid of plansToSync) {
          await syncPlanStatus(pid);
        }
      } catch (err) {
        console.error("❌ Ошибка загрузки истории:", err);
        setError("Не удалось загрузить историю. Попробуйте обновить страницу.");
      } finally {
        setHistoryLoading(false);
      }
    };

    fetchHistory();
  }, [selectedMentorId, apiUrl, syncPlanStatus]);

  const initialScrollDone = useRef(false);

  useEffect(() => {
    initialScrollDone.current = false;
  }, [selectedMentorId]);

  useEffect(() => {
    if (historyLoading || initialScrollDone.current) return;
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ block: "end" });
      initialScrollDone.current = true;
    }
  }, [historyLoading]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const token = localStorage.getItem("access_token");
    if (!token) {
      setError("Необходимо войти в систему");
      return;
    }

    const userMessage: Message = {
      role: "user",
      content: input,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setSending(true);

    try {
      const res = await fetch(`${apiUrl}/chat/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          prompt: userMessage.content,
          mentor_id: selectedMentorId,
        }),
      });

      const data: ChatSendResponse & { detail?: unknown } = await res.json();
      if (!res.ok || !data?.response) {
        const detail =
          typeof data?.detail === "string"
            ? data.detail
            : "Не удалось отправить сообщение";
        throw new Error(detail);
      }

      const aiMessage: Message = {
        role: "assistant",
        content: data.response,
        created_at: new Date().toISOString(),
        planDraft: data.planDraft || undefined,
        plan_id: data.plan_id || undefined,
        plan_status: data.plan_status || undefined,
      };

      setMessages((prev) => [...prev, aiMessage]);

      if (data.plan_id) {
        await syncPlanStatus(data.plan_id);
      }
    } catch (err) {
      console.error("Ошибка при отправке запроса:", err);
      setError(err instanceof Error ? err.message : "Неизвестная ошибка");
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex h-full w-full flex-col gap-4 rounded-3xl border border-white/60 bg-white/80 p-6 shadow-2xl shadow-slate-200/60 backdrop-blur-xl">
      <header className="flex flex-col gap-2 rounded-2xl border border-white/70 bg-white/70 px-4 py-3 shadow-inner shadow-white sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">Наставник</p>
          <h2 className="text-lg font-semibold text-slate-900">{mentor.name}</h2>
          <p className="text-xs text-slate-500">
            {mentor.subject} {mentor.category ? `· ${mentor.category}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Sparkles className="h-4 w-4 text-amber-400" />
          Готов помочь с вашим планом обучения
        </div>
      </header>

      <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-white/60 bg-white/70 shadow-inner shadow-white">
        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4 pr-6">
          {historyLoading ? (
            <div className="flex h-full items-center justify-center text-sm text-slate-500">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Загружаем историю…
            </div>
          ) : messages.length ? (
            messages.map((msg, idx) => {
              const isUser = msg.role === "user";
              return (
                <div key={idx} className={`flex w-full flex-col ${isUser ? "items-end" : "items-start"}`}>
                  {msg.planDraft || msg.plan_snapshot ? (
                    <PlanMessage
                      plan={msg.planDraft || msg.plan_snapshot}
                      plan_id={msg.plan_id || ""}
                      plan_status={msg.plan_status}
                      onConfirm={
                        msg.plan_id && msg.plan_status !== "confirmed" && msg.plan_status !== "deleted"
                          ? () => handleConfirm(msg.plan_id!)
                          : undefined
                      }
                      onReject={
                        msg.plan_id && msg.plan_status !== "confirmed" && msg.plan_status !== "deleted"
                          ? () => handleReject(msg.plan_id!)
                          : undefined
                      }
                    />
                  ) : (
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm shadow-md transition ${
                        isUser
                          ? "bg-gradient-to-r from-sky-200/80 to-indigo-200/80 text-slate-800"
                          : "bg-slate-50/90 text-slate-600"
                      }`}
                    >
                      {msg.content}
                    </div>
                  )}
                  {msg.created_at && (
                    <span className="mt-1 text-xs text-slate-400">
                      {new Date(msg.created_at).toLocaleString()}
                    </span>
                  )}
                </div>
              );
            })
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-sm text-slate-500">
              <CheckCircle2 className="h-6 w-6 text-slate-300" />
              Здесь появится ваш диалог с наставником.
            </div>
          )}
          {sending && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-slate-100 bg-white/80 px-4 py-3">
          {error && (
            <p className="mb-2 rounded-2xl bg-rose-100/70 px-4 py-2 text-xs text-rose-600">
              {error}
            </p>
          )}
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Введите сообщение…"
              className="flex-1 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-200"
              disabled={sending}
            />
            <button
              onClick={handleSend}
              disabled={sending || !input.trim()}
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-sky-300 via-indigo-300 to-violet-300 px-4 py-2 text-sm font-semibold text-slate-900 shadow-lg shadow-sky-100/70 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Отправить"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
