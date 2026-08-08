"use client"

interface ProfileAvatarProps {
  name: string | null
  size?: "sm" | "md" | "lg"
}

export function getAvatarBgColor(name: string | null): string {
  if (!name || name.trim() === "") return "bg-blue-600"
  const firstChar = name.trim().charAt(0).toUpperCase()

  if (firstChar >= "A" && firstChar <= "F") return "bg-blue-600"
  if (firstChar >= "G" && firstChar <= "L") return "bg-emerald-600"
  if (firstChar >= "M" && firstChar <= "R") return "bg-amber-600"
  return "bg-purple-600"
}

export default function ProfileAvatar({ name, size = "md" }: ProfileAvatarProps) {
  const displayName = name && name.trim() !== "" ? name : "Student"
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase()

  const bgColor = getAvatarBgColor(displayName)

  const sizeClasses = {
    sm: "h-8 w-8 text-[11px]",
    md: "h-10 w-10 text-xs font-bold", // Exact 40px
    lg: "h-12 w-12 text-sm font-bold",
  }

  return (
    <div
      className={`flex items-center justify-center rounded-full text-white font-extrabold shadow-sm transition duration-200 shrink-0 ${bgColor} ${sizeClasses[size]}`}
    >
      {initials || "ST"}
    </div>
  )
}
