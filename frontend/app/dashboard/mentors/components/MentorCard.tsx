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
    <div
      onClick={onClick}
      className="cursor-pointer border rounded p-4 shadow-sm bg-white flex gap-4 items-start hover:shadow-md transition"
    >
      {/* Аватар */}
      <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
        {mentor.avatar_url ? (
          <img
            src={`/${mentor.avatar_url}`} // ожидаем относительный путь из public
            alt={mentor.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <img
            src="/default-avatar.png" // fallback если нет аватара
            alt="Нет аватара"
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Инфо */}
      <div className="flex-1 space-y-1">
        <h2 className="text-lg font-semibold">{mentor.name}</h2>
        <p className="text-sm text-gray-500">
          {mentor.subject} · {mentor.category}
        </p>
        <p className="text-sm text-gray-700 line-clamp-2">{mentor.description}</p>
      </div>
    </div>
  )
}