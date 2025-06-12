import type React from "react"
export interface FolderColor {
  name: string
  primary: string
  secondary: string
  accent: string
}

export interface FolderIcon {
  name: string
  icon: string
  category: string
}

export const FOLDER_COLORS: FolderColor[] = [
  { name: "Blue", primary: "#007AFF", secondary: "#E3F2FD", accent: "#1976D2" },
  { name: "Purple", primary: "#AF52DE", secondary: "#F3E5F5", accent: "#7B1FA2" },
  { name: "Pink", primary: "#FF2D92", secondary: "#FCE4EC", accent: "#C2185B" },
  { name: "Red", primary: "#FF3B30", secondary: "#FFEBEE", accent: "#D32F2F" },
  { name: "Orange", primary: "#FF9500", secondary: "#FFF3E0", accent: "#F57C00" },
  { name: "Yellow", primary: "#FFCC02", secondary: "#FFFDE7", accent: "#F9A825" },
  { name: "Green", primary: "#34C759", secondary: "#E8F5E8", accent: "#388E3C" },
  { name: "Teal", primary: "#5AC8FA", secondary: "#E0F2F1", accent: "#00796B" },
  { name: "Indigo", primary: "#5856D6", secondary: "#E8EAF6", accent: "#303F9F" },
  { name: "Gray", primary: "#8E8E93", secondary: "#F5F5F5", accent: "#616161" },
]

export const FOLDER_ICONS: FolderIcon[] = [
  // Academic
  { name: "Books", icon: "📚", category: "Academic" },
  { name: "Science", icon: "🔬", category: "Academic" },
  { name: "Math", icon: "📐", category: "Academic" },
  { name: "History", icon: "🏛️", category: "Academic" },
  { name: "Language", icon: "🗣️", category: "Academic" },
  { name: "Research", icon: "🔍", category: "Academic" },
  { name: "Notes", icon: "📝", category: "Academic" },
  { name: "Study", icon: "🎓", category: "Academic" },

  // Creative
  { name: "Art", icon: "🎨", category: "Creative" },
  { name: "Music", icon: "🎵", category: "Creative" },
  { name: "Video", icon: "🎬", category: "Creative" },
  { name: "Design", icon: "✨", category: "Creative" },
  { name: "Photography", icon: "📸", category: "Creative" },

  // Tech
  { name: "Code", icon: "💻", category: "Tech" },
  { name: "AI", icon: "🤖", category: "Tech" },
  { name: "Data", icon: "📊", category: "Tech" },
  { name: "Security", icon: "🔒", category: "Tech" },

  // Lifestyle
  { name: "Health", icon: "💪", category: "Lifestyle" },
  { name: "Cooking", icon: "👨‍🍳", category: "Lifestyle" },
  { name: "Travel", icon: "✈️", category: "Lifestyle" },
  { name: "Sports", icon: "⚽", category: "Lifestyle" },

  // Business
  { name: "Business", icon: "💼", category: "Business" },
  { name: "Finance", icon: "💰", category: "Business" },
  { name: "Marketing", icon: "📈", category: "Business" },
  { name: "Startup", icon: "🚀", category: "Business" },
]

export const DEFAULT_FOLDERS = [
  { name: "Watch Later", icon: "⏰", color: "Blue", isSystem: true },
  { name: "Favorites", icon: "❤️", color: "Red", isSystem: true },
  { name: "Research", icon: "🔍", color: "Purple", isSystem: true },
  { name: "Tutorials", icon: "🎓", color: "Green", isSystem: true },
]

export function getFolderStyle(color: string): React.CSSProperties {
  const folderColor = FOLDER_COLORS.find((c) => c.name === color) || FOLDER_COLORS[0]
  return {
    backgroundColor: folderColor.secondary,
    borderColor: folderColor.primary,
    color: folderColor.accent,
  }
}

export function getFolderIcon(iconName: string): string {
  const icon = FOLDER_ICONS.find((i) => i.name === iconName)
  return icon ? icon.icon : "📁"
}
