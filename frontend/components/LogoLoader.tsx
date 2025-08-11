"use client"

export default function LogoLoader({ size = 64 }: { size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
      }}
      className="flex items-center justify-center"
    >
      <video
        src="/Animation_Logo.mp4" // путь к твоему mp4-файлу
        width={size}
        height={size}
        autoPlay
        loop
        muted
        playsInline
        className="rounded-full"
      />
    </div>
  )
}