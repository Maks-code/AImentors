"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ShieldCheck, Bell, Palette, Lock, RefreshCw } from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("Maxim Lushkin");
  const [bio, setBio] = useState("Учусь, развиваюсь, создаю!");
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [browserNotifications, setBrowserNotifications] = useState(false);
  const [darkTheme, setDarkTheme] = useState(false);
  const [hideEmail, setHideEmail] = useState(false);
  const [privateProfile, setPrivateProfile] = useState(false);
  const [savingSecurity, setSavingSecurity] = useState(false);

  const handlePasswordChange = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) return alert("Вы не авторизованы");

    setSavingSecurity(true);
    try {
      const res = await fetch("http://localhost:8000/auth/me/password", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ old_password: oldPass, new_password: newPass }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail);

      alert("Пароль успешно обновлён");
      localStorage.removeItem("access_token");
      router.push("/auth");
    } catch (err) {
      alert("Ошибка при смене пароля");
      console.error(err);
    } finally {
      setSavingSecurity(false);
    }
  };

  const handleResetDefaults = () => {
    setFullName("Maxim Lushkin");
    setBio("Учусь, развиваюсь, создаю!");
    setOldPass("");
    setNewPass("");
    setEmailNotifications(true);
    setBrowserNotifications(false);
    setDarkTheme(false);
    setHideEmail(false);
    setPrivateProfile(false);
  };

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl border border-white/60 bg-white/75 p-6 shadow-xl shadow-slate-200/60 backdrop-blur-xl sm:p-10">
        <div className="absolute -top-16 right-10 h-44 w-44 rounded-full bg-sky-200/40 blur-3xl" />
        <div className="absolute -bottom-20 left-6 h-56 w-56 rounded-full bg-indigo-200/35 blur-3xl" />
        <div className="relative space-y-4">
          <span className="inline-flex items-center gap-2 rounded-full bg-sky-100/90 px-3 py-1 text-xs font-medium text-sky-700">
            <ShieldCheck className="h-4 w-4" /> Управление профилем
          </span>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold text-slate-900 md:text-4xl">Настройки аккаунта</h1>
            <p className="max-w-2xl text-sm text-slate-500">
              Обновите личную информацию, конфигурацию уведомлений и приватность. Изменения применяются мгновенно и синхронизуются на всех устройствах.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="full_name" className="text-xs uppercase tracking-[0.3em] text-slate-400">
                Имя
              </Label>
              <Input
                id="full_name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-2 rounded-xl border-slate-200 bg-white/80"
              />
            </div>
            <div>
              <Label htmlFor="bio" className="text-xs uppercase tracking-[0.3em] text-slate-400">
                О себе
              </Label>
              <Textarea
                id="bio"
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="mt-2 rounded-xl border-slate-200 bg-white/80"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button className="rounded-full bg-gradient-to-r from-sky-300 via-indigo-300 to-violet-300 px-5 text-slate-900 shadow-md shadow-sky-100/70 hover:-translate-y-0.5">
              Сохранить профиль
            </Button>
            <Button
              variant="outline"
              className="rounded-full border-slate-200 px-5 text-slate-600 shadow-sm hover:-translate-y-0.5"
              onClick={() => router.push("/dashboard/profile")}
            >
              Открыть страницу профиля
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/60 bg-white/75 p-6 shadow-xl shadow-slate-200/60 backdrop-blur-xl">
          <div className="flex items-center gap-2 text-slate-500">
            <Bell className="h-4 w-4 text-sky-400" />
            <span className="text-sm font-semibold text-slate-700">Уведомления</span>
          </div>
          <p className="mt-2 text-sm text-slate-500">
            Настройте напоминания, чтобы не пропускать новые уроки и отчёты об успехах.
          </p>
          <div className="mt-5 space-y-4 text-sm text-slate-600">
            <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white/80 px-4 py-3">
              <span>Email-уведомления</span>
              <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white/80 px-4 py-3">
              <span>Уведомления в браузере</span>
              <Switch checked={browserNotifications} onCheckedChange={setBrowserNotifications} />
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/60 bg-white/75 p-6 shadow-xl shadow-slate-200/60 backdrop-blur-xl">
          <div className="flex items-center gap-2 text-slate-500">
            <Palette className="h-4 w-4 text-violet-400" />
            <span className="text-sm font-semibold text-slate-700">Оформление</span>
          </div>
          <p className="mt-2 text-sm text-slate-500">
            Переключитесь между светлой и тёмной темами. Изменения вступают в силу немедленно.
          </p>
          <div className="mt-5 flex items-center justify-between rounded-2xl border border-slate-100 bg-white/80 px-4 py-3 text-sm text-slate-600">
            <span>Активировать тёмную тему</span>
            <Switch checked={darkTheme} onCheckedChange={setDarkTheme} />
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/60 bg-white/75 p-6 shadow-xl shadow-slate-200/60 backdrop-blur-xl">
          <div className="flex items-center gap-2 text-slate-500">
            <Lock className="h-4 w-4 text-emerald-400" />
            <span className="text-sm font-semibold text-slate-700">Смена пароля</span>
          </div>
          <p className="mt-2 text-sm text-slate-500">
            После смены пароля потребуется повторный вход. Пароль должен содержать минимум 8 символов.
          </p>
          <div className="mt-4 space-y-3">
            <div>
              <Label htmlFor="oldPass" className="text-xs uppercase tracking-[0.3em] text-slate-400">
                Старый пароль
              </Label>
              <Input
                id="oldPass"
                type="password"
                value={oldPass}
                autoComplete="off"
                onChange={(e) => setOldPass(e.target.value)}
                className="mt-2 rounded-xl border-slate-200 bg-white/80"
              />
            </div>
            <div>
              <Label htmlFor="newPass" className="text-xs uppercase tracking-[0.3em] text-slate-400">
                Новый пароль
              </Label>
              <Input
                id="newPass"
                type="password"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                className="mt-2 rounded-xl border-slate-200 bg-white/80"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={handlePasswordChange}
                disabled={savingSecurity}
                className="rounded-full bg-gradient-to-r from-emerald-300 to-emerald-400 px-5 text-emerald-900 shadow-md shadow-emerald-100/70 hover:-translate-y-0.5"
              >
                {savingSecurity ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Сменить пароль
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setOldPass("");
                  setNewPass("");
                }}
                className="rounded-full border-slate-200 px-5 text-slate-600 shadow-sm hover:-translate-y-0.5"
              >
                Очистить поля
              </Button>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/60 bg-white/75 p-6 shadow-xl shadow-slate-200/60 backdrop-blur-xl">
          <div className="flex items-center gap-2 text-slate-500">
            <ShieldCheck className="h-4 w-4 text-rose-400" />
            <span className="text-sm font-semibold text-slate-700">Приватность</span>
          </div>
          <p className="mt-2 text-sm text-slate-500">Определите, какие данные видят другие пользователи.</p>
          <div className="mt-5 space-y-4 text-sm text-slate-600">
            <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white/80 px-4 py-3">
              <span>Скрывать email от других</span>
              <Switch checked={hideEmail} onCheckedChange={setHideEmail} />
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white/80 px-4 py-3">
              <span>Делать профиль приватным</span>
              <Switch checked={privateProfile} onCheckedChange={setPrivateProfile} />
            </div>
          </div>
        </div>
      </section>

      <section className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-white/60 bg-white/75 p-6 shadow-xl shadow-slate-200/60 backdrop-blur-xl">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-slate-900">Сбросить настройки по умолчанию</h2>
          <p className="text-sm text-slate-500">
            Верните стартовые значения, если хотите настроить всё заново. Ваши планы и прогресс не будут затронуты.
          </p>
        </div>
        <Button
          onClick={handleResetDefaults}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-300 to-rose-400 px-6 py-2 text-rose-900 shadow-lg shadow-rose-100/70 hover:-translate-y-0.5"
        >
          <RefreshCw className="h-4 w-4" /> Сбросить
        </Button>
      </section>
    </div>
  );
}
