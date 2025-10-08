import Image from "next/image";

interface Mentor {
  id: string;
  name: string;
  subject: string;
  description: string;
  avatar_url?: string;
  category: string;
}

interface MentorCardProps {
  mentor: Mentor;
  onClick: () => void;
}

export default function MentorCard({ mentor, onClick }: MentorCardProps) {
  return (
    <button
      onClick={onClick}
      className="group flex h-full flex-col gap-4 rounded-3xl border border-white/70 bg-white/80 p-5 text-left shadow-lg shadow-slate-200/60 backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-2xl dark:border-slate-800/60 dark:bg-slate-900/70 dark:shadow-slate-950/50"
    >
      <div className="flex items-start gap-4">
        <div className="h-16 w-16 overflow-hidden rounded-2xl bg-slate-100 shadow-inner shadow-white transition-colors dark:bg-slate-800/70 dark:shadow-slate-950/40">
          <Image
            src={mentor.avatar_url ? `/${mentor.avatar_url}` : "/default-avatar.png"}
            alt={mentor.name}
            width={64}
            height={64}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="flex-1 space-y-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">{mentor.category}</p>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{mentor.name}</h3>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-sky-100/80 px-3 py-1 text-xs font-medium text-sky-600 transition-colors dark:bg-slate-800/70 dark:text-slate-200">
            {mentor.subject}
          </span>
        </div>
      </div>
      <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3">{mentor.description}</p>
      <span className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white/90 px-4 py-2 text-xs font-semibold text-slate-600 transition group-hover:border-sky-200 group-hover:text-sky-600 dark:border-slate-700/60 dark:bg-slate-900/70 dark:text-slate-300">
        Открыть профиль
      </span>
    </button>
  );
}
