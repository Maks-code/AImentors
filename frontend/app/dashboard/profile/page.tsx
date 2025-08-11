"use client";

// -----------------------------------------------------------------------------
// ProfilePage.tsx — расширенный профиль пользователя с «игровыми» блоками
// -----------------------------------------------------------------------------
// Блоки:
//   1. Карточка профиля (аватар + базовые данные)
//   2. Ваш прогресс (уровень, XP‑бар, серия, очки за неделю)
//   3. Мои менторы (горизонтальный список активных ИИ‑наставников)
//   4. План обучения (аккордеон предстоящих уроков/ДЗ)
//   5. Достижения (бейджи)
//   6. Настройки уведомлений (тогглы)
//
// Все данные кроме самого user приходят из `dummy*`‑констант. Под каждым есть
// TODO‑комментарий: на какой эндпоинт их заменить.
// -----------------------------------------------------------------------------

import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import AvatarPicker from "./components/AvatarPicker";
import LogoLoader from "@/components/LogoLoader";

// -----------------------------------------------------------------------------
// Типы
// -----------------------------------------------------------------------------
interface User {
  id: string;
  email: string;
  full_name: string;
  bio?: string;
  role: string;
  created_at: string;
  avatar_url?: string;
  // В будущем: notification prefs, security, etc.
}

// -----------------------------------------------------------------------------
// DUMMY DATA (заменить на реальные запросы)
// -----------------------------------------------------------------------------
/**
 * TODO: заменить на GET /users/me/progress
 */
const dummyProgress = {
  level: 3,
  currentXP: 220,
  nextXP: 300,
  weeklyPoints: 150,
  streak: 7,
};

/**
 * TODO: заменить на GET /mentors/active
 */
const dummyMentors = [
  {
    id: "math-mentor",
    name: "Ментор Математики",
    avatar: "/placeholders/math.png",
    todayLesson: true,
  },
  {
    id: "lang-mentor",
    name: "Английский AI",
    avatar: "/placeholders/eng.png",
    todayLesson: false,
  },
  {
    id: "code-mentor",
    name: "JS Sensei",
    avatar: "/placeholders/code.png",
    todayLesson: true,
  },
];

/**
 * TODO: заменить на GET /users/me/schedule?limit=5
 */
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

/**
 * TODO: заменить на GET /users/me/achievements
 */
const dummyAchievements = [
  { id: "streak-7", name: "7‑day Streak", icon: <Flame size={20} /> },
  { id: "xp-1000", name: "1000 XP", icon: <Trophy size={20} /> },
  { id: "lvl-3", name: "Level 3", icon: <Play size={20} /> },
];

// -----------------------------------------------------------------------------
// Компонент
// -----------------------------------------------------------------------------
export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // dialogs
  const [editOpen, setEditOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);

  // form state
  const [form, setForm] = useState({ full_name: "", bio: "" });
  const [saving, setSaving] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);

  // ---------------------------------------------------------------------------
  // Fetch profile
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) return;
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

  // ---------------------------------------------------------------------------
  // Save profile (fullname + bio)
  // ---------------------------------------------------------------------------
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
      setUser((prev) =>
        prev ? { ...prev, full_name: form.full_name, bio: form.bio } : prev,
      );
      setEditOpen(false);
    } catch (err) {
      console.error("Ошибка сохранения профиля", err);
    } finally {
      setSaving(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Save avatar
  // ---------------------------------------------------------------------------
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
      setUser((prev) =>
        prev ? { ...prev, avatar_url: selectedAvatar } : prev,
      );
      setAvatarOpen(false);
      setSelectedAvatar(null);
    } catch (err) {
      console.error("Ошибка сохранения аватара", err);
    }
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <LogoLoader size={96} />
        <p className="mt-4 text-muted-foreground text-sm">Загружаем профиль…</p>
      </div>
    );
  }

  if (!user) {
    return <p className="p-6">Профиль не найден…</p>;
  }

  return (
    <div className="p-6 mx-auto w-full max-w-3xl space-y-8">
      {/* --------------------------------------------------------------------- */}
      {/* PROFILE CARD                                                         */}
      {/* --------------------------------------------------------------------- */}
      <Card>
        <CardHeader>
          <CardTitle>Профиль</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-6">
            {/* Avatar */}
            <div className="relative w-24 h-24 shrink-0">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt="Аватар"
                  className="w-full h-full rounded-full object-cover border"
                />
              ) : (
                <div className="w-full h-full rounded-full flex items-center justify-center bg-muted text-3xl font-semibold uppercase text-muted-foreground border">
                  {user.full_name?.[0] ?? "?"}
                </div>
              )}
              <button
                onClick={() => setAvatarOpen(true)}
                className="absolute -bottom-2 -right-2 bg-background border shadow rounded-full p-2 hover:bg-accent"
              >
                <Camera size={16} />
              </button>
            </div>

            {/* Info */}
            <div className="flex-1 space-y-1 text-sm">
              <p>
                <span className="text-muted-foreground">ФИО:</span> <strong>{user.full_name}</strong>
              </p>
              <p>
                <span className="text-muted-foreground">Email:</span> <strong>{user.email}</strong>
              </p>
              <p>
                <span className="text-muted-foreground">Дата регистрации:</span> {new Date(user.created_at).toLocaleDateString()}
              </p>
              <p>
                <span className="text-muted-foreground">Роль:</span> <strong>{user.role}</strong>
              </p>
              <p>
                <span className="text-muted-foreground">О себе:</span> {user.bio || "—"}
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button size="sm" onClick={() => setEditOpen(true)}>
            <Pencil size={16} className="mr-1" /> Редактировать
          </Button>
        </CardFooter>
      </Card>

      {/* --------------------------------------------------------------------- */}
      {/* PROGRESS                                                             */}
      {/* --------------------------------------------------------------------- */}
      <Card>
        <CardHeader>
          <CardTitle>Ваш прогресс</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span>Уровень {dummyProgress.level}</span>
            <span>
              {dummyProgress.currentXP} / {dummyProgress.nextXP} XP
            </span>
          </div>
          <Progress
            value={(dummyProgress.currentXP / dummyProgress.nextXP) * 100}
          />
          <div className="flex gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Flame size={16} className="text-orange-500" /> Серия:
              {dummyProgress.streak} дн.
            </div>
            <div className="flex items-center gap-2">
              <Trophy size={16} className="text-yellow-500" /> Очков за неделю:
              {dummyProgress.weeklyPoints}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* --------------------------------------------------------------------- */}
      {/* ACTIVE MENTORS                                                       */}
      {/* --------------------------------------------------------------------- */}
      <Card>
        <CardHeader>
          <CardTitle>Мои менторы</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {dummyMentors.map((m) => (
              <div
                key={m.id}
                className="min-w-[140px] rounded-lg border p-3 flex flex-col items-center text-center shadow-sm bg-card hover:shadow-md transition-shadow"
              >
                <img
                  src={m.avatar}
                  alt={m.name}
                  className="w-12 h-12 rounded-full object-cover mb-2"
                />
                <p className="text-sm font-medium line-clamp-2">{m.name}</p>
                {m.todayLesson && (
                  <Badge variant="secondary" className="mt-2">
                    Урок сегодня
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* --------------------------------------------------------------------- */}
      {/* PLAN / SCHEDULE                                                      */}
      {/* --------------------------------------------------------------------- */}
      <Card>
        <CardHeader>
          <CardTitle>План обучения</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible>
            {dummySchedule.map((item) => (
              <AccordionItem value={String(item.id)} key={item.id}>
                <AccordionTrigger>
                  <span className="text-left">
                    {new Date(item.date).toLocaleDateString()} — {item.title}
                  </span>
                  <Badge className="ml-auto" variant="outline">
                    {item.status}
                  </Badge>
                </AccordionTrigger>
                <AccordionContent>
                  {/* TODO: подгрузить детали урока/ДЗ по item.id */}
                  <p className="text-sm text-muted-foreground">
                    Подробности урока будут доступны после подключения API.
                  </p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* --------------------------------------------------------------------- */}
      {/* ACHIEVEMENTS                                                         */}
      {/* --------------------------------------------------------------------- */}
      <Card>
        <CardHeader>
          <CardTitle>Достижения</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {dummyAchievements.map((a) => (
              <div
                key={a.id}
                className="flex flex-col items-center gap-2 p-3 border rounded-lg"
              >
                <span className="text-primary">{a.icon}</span>
                <span className="text-xs text-center line-clamp-2">
                  {a.name}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* --------------------------------------------------------------------- */}
      {/* NOTIFICATION SETTINGS                                                */}
      {/* --------------------------------------------------------------------- */}
      <Card>
        <CardHeader>
          <CardTitle>Уведомления</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="flex items-center justify-between">
            <span>Ежедневное напоминание об уроке</span>
            <Switch /* TODO: связать с user.notification.daily */ />
          </div>
          <div className="flex items-center justify-between">
            <span>Email-дайджест прогресса</span>
            <Switch /* TODO: связать с user.notification.email */ />
          </div>
          <div className="flex items-center justify-between">
            <span>Push-уведомления на устройство</span>
            <Switch /* TODO: связать с user.notification.push */ />
          </div>
        </CardContent>
      </Card>

      {/* --------------------------------------------------------------------- */}
      {/* EDIT PROFILE DIALOG                                                  */}
      {/* --------------------------------------------------------------------- */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Редактировать профиль</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">ФИО</Label>
              <Input
                id="full_name"
                value={form.full_name}
                onChange={(e) =>
                  setForm({ ...form, full_name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">О себе</Label>
              <Textarea
                id="bio"
                rows={4}
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleSaveProfile} disabled={saving}>
              {saving && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Сохранить
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* --------------------------------------------------------------------- */}
      {/* AVATAR DIALOG                                                        */}
      {/* --------------------------------------------------------------------- */}
      <Dialog open={avatarOpen} onOpenChange={setAvatarOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Выберите аватар</DialogTitle>
          </DialogHeader>

          <AvatarPicker
            selected={selectedAvatar}
            onSelect={setSelectedAvatar}
          />

          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setAvatarOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleSaveAvatar} disabled={!selectedAvatar}>
              Сохранить
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
