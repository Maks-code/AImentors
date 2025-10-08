// Файл: app/(dashboard)/mentors/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import MentorCard from "./components/MentorCard";
import MentorModal from "./components/MentorModal";
import LogoLoader from "@/components/LogoLoader";

interface Mentor {
  id: string;
  name: string;
  subject: string;
  description: string;
  avatar_url?: string;
  category: string;
}

export default function MentorsPage() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const res = await fetch("http://localhost:8000/mentors");
        const data = await res.json();
        setMentors(data);
      } catch (err) {
        console.error("Ошибка загрузки менторов", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMentors();
  }, []);

  const categories = useMemo(() => {
    const unique = new Set<string>();
    mentors.forEach((mentor) => {
      if (mentor.category) unique.add(mentor.category);
    });
    return ["all", ...Array.from(unique)];
  }, [mentors]);

  const filteredMentors = mentors.filter((mentor) => {
    const matchesSearch =
      mentor.name.toLowerCase().includes(search.toLowerCase()) ||
      mentor.subject.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || mentor.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 text-slate-500 dark:text-slate-400">
        <LogoLoader size={80} />
        <p className="text-sm font-medium">Загружаем менторов…</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-slate-900 transition-colors duration-500 dark:text-slate-100">
      <section className="relative overflow-hidden rounded-3xl border border-white/60 bg-white/80 p-6 shadow-xl shadow-slate-200/60 backdrop-blur-xl transition-colors duration-500 sm:p-10 dark:border-slate-800/60 dark:bg-slate-900/70 dark:shadow-slate-950/50">
        <div className="absolute -top-16 right-10 h-44 w-44 rounded-full bg-sky-200/40 blur-3xl transition-colors duration-500 dark:bg-slate-800/40" />
        <div className="absolute -bottom-20 left-6 h-56 w-56 rounded-full bg-indigo-200/35 blur-3xl transition-colors duration-500 dark:bg-indigo-900/35" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full bg-sky-100/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-sky-600 transition-colors dark:bg-slate-800/70 dark:text-slate-200">
              Наставники
            </span>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100 md:text-4xl">
                Найдите наставника под ваш темп изучения
              </h1>
              <p className="max-w-2xl text-sm text-slate-500 dark:text-slate-400">
                Фильтруйте по направлению и категории, чтобы выбрать эксперта, который поможет вам быстрее достичь целей.
              </p>
            </div>
          </div>
          <div className="w-full max-w-md">
            <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
              Поиск наставника
            </label>
            <div className="mt-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 shadow-inner shadow-white transition-colors dark:border-slate-700/60 dark:bg-slate-900/70 dark:shadow-slate-950/40">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Введите имя или направление…"
                className="w-full border-none bg-transparent text-sm text-slate-700 transition-colors placeholder:text-slate-400 focus:outline-none dark:text-slate-200 dark:placeholder:text-slate-500"
              />
            </div>
          </div>
        </div>
      </section>

      {categories.length > 1 && (
        <div className="flex flex-wrap gap-3">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition ${
                selectedCategory === category
                  ? "bg-gradient-to-r from-sky-300 via-indigo-300 to-violet-300 text-slate-900 dark:text-slate-100 shadow-lg shadow-sky-100/70"
                  : "border border-slate-200 bg-white/80 text-slate-500 shadow-sm transition-colors hover:-translate-y-0.5 dark:border-slate-700/60 dark:bg-slate-900/70 dark:text-slate-400"
              }`}
            >
              {category === "all" ? "Все категории" : category}
            </button>
          ))}
        </div>
      )}

      {filteredMentors.length ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filteredMentors.map((mentor) => (
            <MentorCard key={mentor.id} mentor={mentor} onClick={() => setSelectedMentor(mentor)} />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white/80 p-10 text-center text-sm text-slate-500 transition-colors dark:border-slate-700/60 dark:bg-slate-900/65 dark:text-slate-400">
          По запросу ничего не найдено. Попробуйте изменить фильтры или сбросить поиск.
        </div>
      )}

      {selectedMentor && (
        <MentorModal mentor={selectedMentor} onClose={() => setSelectedMentor(null)} />
      )}
    </div>
  );
}
