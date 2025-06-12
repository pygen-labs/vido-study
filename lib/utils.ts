import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

export function formatDuration(duration: string): string {
  if (duration.startsWith("PT")) {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
    if (match) {
      const hours = Number.parseInt(match[1] || "0")
      const minutes = Number.parseInt(match[2] || "0")
      const seconds = Number.parseInt(match[3] || "0")

      if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
      }
      return `${minutes}:${seconds.toString().padStart(2, "0")}`
    }
  }
  return duration
}

export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = Math.floor(seconds % 60)

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
  }
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
}

export function parseTimeToSeconds(timeString: string): number {
  const parts = timeString.split(":").map((part) => Number.parseInt(part) || 0)

  if (parts.length === 1) {
    return parts[0]
  } else if (parts.length === 2) {
    return parts[0] * 60 + parts[1]
  } else if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2]
  }

  return 0
}

export function validateTimeFormat(timeString: string): boolean {
  const timeRegex = /^(\d{1,2}:)?(\d{1,2}:)?\d{1,2}$/
  return timeRegex.test(timeString)
}
