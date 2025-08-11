// Файл: app/(dashboard)/profile/components/AvatarPicker.tsx
"use client"

interface AvatarPickerProps {
  selected?: string | null
  onSelect: (url: string) => void
}

const AVATARS = [
  "/avatars/avatar1.png",
  "/avatars/avatar2.png",
  "/avatars/avatar3.png",
  "/avatars/avatar4.png",
  // добавь остальные пути, если есть
]

export default function AvatarPicker({ selected, onSelect }: AvatarPickerProps) {
  return (
    <div className="grid grid-cols-4 gap-4">
      {AVATARS.map((url) => (
        <button
          key={url}
          onClick={() => onSelect(url)}
          className={`border-2 rounded-full p-1 transition 
            ${selected === url ? "border-blue-500" : "border-transparent hover:border-gray-300"}`}
        >
          <img
            src={url}
            alt="Аватар"
            className="w-16 h-16 rounded-full object-cover"
          />
        </button>
      ))}
    </div>
  )
}