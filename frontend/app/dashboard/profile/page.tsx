"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Loader2,
  Pencil,
  Camera,
  Flame,
  Trophy,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import AvatarPicker from "./components/AvatarPicker";
import LogoLoader from "@/components/LogoLoader";

interface User {
  id: string;
  email: string;
  full_name: string;
  bio?: string;
  role: string;
  created_at: string;
  avatar_url?: string;
}

interface ActiveMentor {
  id: string;
  name: string;
  subject?: string;
  avatar_url?: string;
  todayLesson?: boolean;
}

const dummyProgress = {
  level: 3,
  currentXP: 220,
  nextXP: 300,
  weeklyPoints: 150,
  streak: 7,
};

const dummySchedule = [
  {
    id: 1,
    date: new Date().toISOString(),
    title: "Урок: Квадратичные уравнения",
    status: "Запланировано",
  },
  {
    id: 2,
    date: new Date(Date.now() + 86400000).toISOString(),
    title: "ДЗ: 20 слов (EN)",
    status: "Ожидает",
  },
  {
    id: 3,
    date: new Date(Date.now() + 2 * 86400000).toISOString(),
    title: "Урок: Async/Await в JS",
    status: "Запланировано",
  },
];

const dummyAchievements = [
  { id: "streak-7", name: "7‑day Streak", icon: <Flame size={20} /> },
  { id: "xp-1000", name: "1000 XP", icon: <Trophy size={20} /> },
  { id: "lvl-3", name: "Level 3", icon: <Play size={20} /> },
];

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeMentors, setActiveMentors] = useState<ActiveMentor[]>([]);
  const [loadingMentors, setLoadingMentors] = useState(true);

  const router = useRouter();

  const [editOpen, setEditOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [form, setForm] = useState({ full_name: "", bio: "" });
  const [saving, setSaving] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch("http://localhost:8000/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Не удалось получить профиль");
        const data = await res.json();
        setUser(data);
        setForm({ full_name: data.full_name || "", bio: data.bio || "" });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchMentors = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setLoadingMentors(false);
        return;
      }
      try {
        const res = await fetch("http://localhost:8000/chat/history", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Не удалось получить менторов");
        const data: unknown = await res.json();
        const formatted = Array.isArray(data) ? (data as ActiveMentor[]) : [];
        setActiveMentors(formatted);
      } catch (err) {
        console.error(err);
        setActiveMentors([]);
      } finally {
        setLoadingMentors(false);
      }
    };
    fetchMentors();
  }, []);

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    const token = localStorage.getItem("access_token");
    try {
      await fetch("http://localhost:8000/auth/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ full_name: form.full_name, bio: form.bio }),
      });
      setUser((prev) => (prev ? { ...prev, full_name: form.full_name, bio: form.bio } : prev));
      setEditOpen(false);
    } catch (err) {
      console.error("Ошибка сохранения профиля", err);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAvatar = async () => {
    if (!selectedAvatar) return;
    const token = localStorage.getItem("access_token");
    if (!token) return;
    try {
      await fetch("http://localhost:8000/auth/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ avatar_url: selectedAvatar }),
      });
      setUser((prev) => (prev ? { ...prev, avatar_url: selectedAvatar } : prev));
      setAvatarOpen(false);
      setSelectedAvatar(null);
    } catch (err) {
      console.error("Ошибка сохранения аватара", err);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 text-slate-500 dark:text-slate-400">
        <LogoLoader size={80} />
        <p className="text-sm font-medium">Загружаем профиль…</p>
      </div>
    );
  }

  if (!user) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">Профиль не найден…</p>;
  }

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl border border-white/60 dark:border-slate-800/60 bg-white/75 dark:bg-slate-900/70 p-6 shadow-xl shadow-slate-200/60 dark:shadow-slate-950/50 backdrop-blur-xl sm:p-10">
        <div className="absolute -top-16 right-10 h-44 w-44 rounded-full bg-sky-200/40 dark:bg-slate-800/40 blur-3xl" />
        <div className="absolute -bottom-20 left-6 h-56 w-56 rounded-full bg-indigo-200/35 dark:bg-indigo-900/35 blur-3xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center">
          <div className="relative mx-auto w-fit">
            <div className="h-32 w-32 overflow-hidden rounded-3xl border-4 border-white shadow-lg shadow-slate-300">
              {user.avatar_url ? (
                <Image src={user.avatar_url} alt="Аватар" width={128} height={128} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-slate-100 dark:bg-slate-800/70 text-3xl font-semibold uppercase text-slate-400 dark:text-slate-500">
                  {user.full_name?.[0] ?? "?"}
                </div>
              )}
            </div>
            <button
              onClick={() => setAvatarOpen(true)}
              className="absolute -bottom-2 -right-2 inline-flex items-center gap-1 rounded-full bg-white dark:bg-slate-900 px-3 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300 shadow-lg shadow-slate-200 dark:shadow-slate-950/50 transition hover:-translate-y-0.5"
            >
              <Camera size={14} /> Сменить
            </button>
          </div>
          <div className="flex-1 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Badge className="bg-sky-100 text-sky-600 dark:bg-slate-800/70 dark:text-slate-200">{user.role}</Badge>
              <Badge variant="outline" className="border-slate-200 text-slate-500 dark:text-slate-400">
                На платформе с {new Date(user.created_at).toLocaleDateString()}
              </Badge>
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100 md:text-4xl">{user.full_name || "Без имени"}</h1>
              <p className="max-w-2xl text-sm text-slate-500 dark:text-slate-400">
                {user.bio || "Добавьте краткую информацию о себе, чтобы наставники лучше понимали ваши цели."}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
              <Badge variant="secondary">Lvl {dummyProgress.level}</Badge>
              <Badge variant="outline" className="border-emerald-200 text-emerald-600">
                🔥 Серия {dummyProgress.streak} дн.
              </Badge>
              <span className="rounded-full bg-slate-100 dark:bg-slate-800/70 px-3 py-1 text-xs text-slate-500 dark:text-slate-400">XP: {dummyProgress.currentXP}</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <span className="font-medium text-slate-600 dark:text-slate-300">Email:</span>
              <span>{user.email}</span>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                size="sm"
                onClick={() => setEditOpen(true)}
                className="rounded-full bg-gradient-to-r from-sky-300 via-indigo-300 to-violet-300 px-5 text-slate-900 dark:text-slate-100 shadow-md shadow-sky-100/70 hover:-translate-y-0.5"
              >
                <Pencil size={16} className="mr-1" /> Редактировать профиль
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="rounded-full border-slate-200 px-5 text-slate-600 dark:text-slate-300 shadow-sm hover:-translate-y-0.5"
                onClick={() => router.push("/dashboard/learning")}
              >
                Перейти к обучению
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/60 dark:border-slate-800/60 bg-white/75 dark:bg-slate-900/70 p-6 shadow-xl shadow-slate-200/60 dark:shadow-slate-950/50 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Ваш прогресс</h2>
            <Badge variant="outline" className="border-slate-200 text-slate-500 dark:text-slate-400">
              +{dummyProgress.weeklyPoints} очков за неделю
            </Badge>
          </div>
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
              <span>Уровень {dummyProgress.level}</span>
              <span>{dummyProgress.currentXP} / {dummyProgress.nextXP} XP</span>
            </div>
            <div className="rounded-full bg-slate-100 dark:bg-slate-800/70">
              <Progress
                value={(dummyProgress.currentXP / dummyProgress.nextXP) * 100}
                className="h-3 rounded-full"
              />
            </div>
            <div className="grid gap-4 text-sm text-slate-600 dark:text-slate-300 sm:grid-cols-2">
              <div className="flex items-center gap-2 rounded-2xl border border-slate-100 bg-white/80 dark:bg-slate-900/65 px-4 py-3">
                <Flame size={18} className="text-orange-500" /> Серия {dummyProgress.streak} дн.
              </div>
              <div className="flex items-center gap-2 rounded-2xl border border-slate-100 bg-white/80 dark:bg-slate-900/65 px-4 py-3">
                <Trophy size={18} className="text-yellow-500" /> Очков за неделю: {dummyProgress.weeklyPoints}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/60 dark:border-slate-800/60 bg-white/75 dark:bg-slate-900/70 p-6 shadow-xl shadow-slate-200/60 dark:shadow-slate-950/50 backdrop-blur-xl">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Достижения</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {dummyAchievements.map((a) => (
              <div
                key={a.id}
                className="flex flex-col items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50/80 dark:bg-slate-800/40 p-4 text-center text-sm text-slate-600 dark:text-slate-300 shadow-inner"
              >
                <span className="text-sky-500">{a.icon}</span>
                <span className="text-xs font-medium">{a.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/60 dark:border-slate-800/60 bg-white/75 dark:bg-slate-900/70 p-6 shadow-xl shadow-slate-200/60 dark:shadow-slate-950/50 backdrop-blur-xl">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">План обучения</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Детали уроков и домашних заданий появятся здесь после подключения API.
          </p>
          <Accordion type="single" collapsible className="mt-4">
            {dummySchedule.map((item) => (
              <AccordionItem value={String(item.id)} key={item.id}>
                <AccordionTrigger>
                  <span className="text-left text-sm text-slate-700 dark:text-slate-200">
                    {new Date(item.date).toLocaleDateString()} — {item.title}
                  </span>
                  <Badge variant="outline" className="ml-auto border-slate-200 text-slate-500 dark:text-slate-400">
                    {item.status}
                  </Badge>
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Подробности урока станут доступны после подключения API.
                  </p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div className="rounded-3xl border border-white/60 dark:border-slate-800/60 bg-white/75 dark:bg-slate-900/70 p-6 shadow-xl shadow-slate-200/60 dark:shadow-slate-950/50 backdrop-blur-xl">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Мои наставники</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Последние диалоги из раздела чатов.</p>
          {loadingMentors ? (
            <div className="mt-6 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <Loader2 className="h-4 w-4 animate-spin" /> Загружаем наставников…
            </div>
          ) : activeMentors.length ? (
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              {activeMentors.map((m) => (
                <button
                  key={m.id}
                  className="flex flex-col items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 dark:bg-slate-800/40 px-4 py-5 text-center text-sm text-slate-600 dark:text-slate-300 shadow-inner transition hover:-translate-y-0.5"
                  onClick={() => router.push(`/dashboard/chats?selected=${m.id}`)}
                >
                  <div className="h-12 w-12 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800/70">
                    <Image
                      src={m.avatar_url ? `/${m.avatar_url}` : "/default-avatar.png"}
                      alt={m.name}
                      width={48}
                      height={48}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <p className="text-sm font-medium line-clamp-2">{m.name}</p>
                  {m.todayLesson && (
                    <Badge variant="secondary" className="bg-sky-100 text-sky-600 dark:bg-slate-800/70 dark:text-slate-200">
                      Урок сегодня
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">Нет активных менторов</p>
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-white/60 dark:border-slate-800/60 bg-white/75 dark:bg-slate-900/70 p-6 shadow-xl shadow-slate-200/60 dark:shadow-slate-950/50 backdrop-blur-xl">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Уведомления</h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Настройте напоминания, чтобы не пропускать новые уроки и отчёты.
        </p>
        <div className="mt-5 space-y-4 text-sm">
          <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white/80 dark:bg-slate-900/65 px-4 py-3">
            <span>Ежедневное напоминание об уроке</span>
            <Switch />
          </div>
          <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white/80 dark:bg-slate-900/65 px-4 py-3">
            <span>Email-дайджест прогресса</span>
            <Switch />
          </div>
          <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white/80 dark:bg-slate-900/65 px-4 py-3">
            <span>Push-уведомления на устройство</span>
            <Switch />
          </div>
        </div>
      </section>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="rounded-2xl border border-white/60 dark:border-slate-800/60 bg-white/85 dark:bg-slate-900/70 p-6 shadow-xl shadow-slate-200/70 dark:shadow-slate-950/50 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-slate-100">Редактировать профиль</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Имя</Label>
              <Input
                id="full_name"
                value={form.full_name}
                onChange={(e) => setForm((prev) => ({ ...prev, full_name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">О себе</Label>
              <Textarea
                id="bio"
                value={form.bio}
                onChange={(e) => setForm((prev) => ({ ...prev, bio: e.target.value }))}
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditOpen(false)} className="rounded-full">
                Отмена
              </Button>
              <Button onClick={handleSaveProfile} disabled={saving} className="rounded-full">
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Сохранить
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={avatarOpen} onOpenChange={setAvatarOpen}>
        <DialogContent className="rounded-2xl border border-white/60 dark:border-slate-800/60 bg-white/85 dark:bg-slate-900/70 p-6 shadow-xl shadow-slate-200/70 dark:shadow-slate-950/50 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-slate-100">Выберите новый аватар</DialogTitle>
          </DialogHeader>
          <AvatarPicker value={selectedAvatar} onChange={setSelectedAvatar} />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setAvatarOpen(false)} className="rounded-full">
              Отмена
            </Button>
            <Button onClick={handleSaveAvatar} disabled={!selectedAvatar} className="rounded-full">
              Сохранить
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
