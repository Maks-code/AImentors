"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { AuthForm } from "@/components/AuthForm";

const floatingTransition = {
  duration: 16,
  repeat: Infinity,
  repeatType: "reverse" as const,
  ease: "easeInOut",
};

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login");

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_20%_20%,rgba(125,211,252,0.2),transparent_55%),radial-gradient(circle_at_80%_0%,rgba(196,181,253,0.25),transparent_45%),linear-gradient(120deg,#ebf4ff,#ede9fe,#faf5ff)] px-4 py-16 sm:px-8">
      {/* Animated background bubbles */}
      <motion.div
        className="absolute -top-24 -left-20 h-72 w-72 rounded-full bg-sky-200/50 blur-3xl"
        animate={{ x: [0, 40, -20], y: [0, 30, -10] }}
        transition={floatingTransition}
      />
      <motion.div
        className="absolute bottom-[-10%] right-[10%] h-96 w-96 rounded-full bg-indigo-200/45 blur-3xl"
        animate={{ x: [0, -30, 20], y: [0, -40, 10] }}
        transition={{ ...floatingTransition, duration: 20 }}
      />
      <motion.div
        className="absolute top-[20%] right-[15%] h-64 w-64 rounded-full bg-violet-200/40 blur-3xl"
        animate={{ y: [0, 25, -15], x: [0, 15, -10] }}
        transition={{ ...floatingTransition, duration: 18 }}
      />

      <div className="relative z-10 w-full max-w-5xl">
        <div className="grid gap-10 rounded-3xl border border-white/60 bg-white/75 p-6 shadow-2xl shadow-slate-200/70 backdrop-blur-2xl lg:grid-cols-[minmax(0,1fr)_420px] lg:p-10">
          <section className="flex flex-col justify-between gap-8">
            <div className="space-y-6">
              <span className="inline-flex items-center gap-2 rounded-full bg-sky-100/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-sky-700">
                AIVY доступа
              </span>
              <div className="space-y-4">
                <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">
                  Добро пожаловать в ваш персональный центр обучения и наставничества
                </h1>
                <p className="max-w-xl text-sm text-slate-500">
                  Войдите в аккаунт, чтобы продолжить обучение, или зарегистрируйтесь, если вы здесь впервые. Один аккаунт — доступ к чатам с AI‑наставниками, прогрессу и планам обучения.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-100 bg-white/80 p-4 text-sm text-slate-600 shadow-inner">
                  <p className="font-semibold text-slate-900">Мгновенный старт</p>
                  <p className="mt-1 text-xs text-slate-500">Продолжайте планы обучения там, где остановились: прогресс синхронизируется.</p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-white/80 p-4 text-sm text-slate-600 shadow-inner">
                  <p className="font-semibold text-slate-900">AI-наставники 24/7</p>
                  <p className="mt-1 text-xs text-slate-500">Свяжитесь с наставником в любой момент и получайте рекомендации по развитию.</p>
                </div>
              </div>
            </div>
            <div className="hidden items-center gap-3 text-sm text-slate-500 sm:flex">
              <span className="h-px flex-1 bg-slate-200" />
              Защищаем ваши данные и используем только проверенные провайдеры.
              <span className="h-px flex-1 bg-slate-200" />
            </div>
          </section>

          <section className="relative flex flex-col gap-6 rounded-2xl border border-white/70 bg-white/80 p-6 shadow-xl shadow-slate-200/60">
            <div className="flex w-full items-center justify-center rounded-full bg-slate-100/70 p-1 text-sm font-medium text-slate-500">
              {(["login", "register"] as const).map((item) => (
                <button
                  key={item}
                  onClick={() => setMode(item)}
                  className={`flex-1 rounded-full px-4 py-2 transition-all ${
                    mode === item
                      ? "bg-white text-slate-900 shadow"
                      : "hover:text-slate-700"
                  }`}
                >
                  {item === "login" ? "Войти" : "Создать аккаунт"}
                </button>
              ))}
            </div>

            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-semibold text-slate-900">
                {mode === "login" ? "С возвращением" : "Регистрируем новый профиль"}
              </h2>
              <p className="text-sm text-slate-500">
                {mode === "login"
                  ? "Введите данные, чтобы открыть панель обучения и чаты с наставниками."
                  : "Заполните форму, чтобы получить доступ к персональным планам и прогрессу."}
              </p>
            </div>

            <AuthForm mode={mode} />

            <div className="rounded-2xl border border-slate-100 bg-white/70 px-4 py-3 text-xs text-slate-500 shadow-inner">
              Нажимая на кнопку, вы соглашаетесь с нашими условиями использования и политикой конфиденциальности. Мы используем безопасное шифрование для защиты ваших данных.
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
