"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, FolderPlus, Search, Grid3X3, List, MoreHorizontal, Trash2 } from "lucide-react"
import { vidoDB } from "@/lib/indexeddb"
import { FOLDER_COLORS } from "@/lib/folder-system"
import { useToast } from "@/components/ui/use-toast"

interface Folder {
  id: string
  name: string
  color: string
  icon: string
  isSystem?: boolean
  videoCount?: number
}

interface FolderGridProps {
  onFolderSelect: (folder: Folder) => void
  selectedFolderId?: string
  onFolderUpdate?: () => void
}

export function FolderGrid({ onFolderSelect, selectedFolderId, onFolderUpdate }: FolderGridProps) {
  const [folders, setFolders] = useState<Folder[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newFolderName, setNewFolderName] = useState("")
  const [newFolderColor, setNewFolderColor] = useState("Blue")
  const { toast } = useToast()

  useEffect(() => {
    loadFolders()
  }, [])

  const loadFolders = async () => {
    try {
      const allFolders = await vidoDB.getFolders()

      // Get video counts for each folder
      const foldersWithCounts = await Promise.all(
        allFolders.map(async (folder) => {
          const videos = await vidoDB.getVideosByFolder(folder.id)
          return { ...folder, videoCount: videos.length }
        }),
      )

      setFolders(foldersWithCounts)
      onFolderUpdate?.()
    } catch (error) {
      console.error("Failed to load folders:", error)
    }
  }

  const createFolder = async () => {
    if (!newFolderName.trim()) return

    try {
      await vidoDB.createFolder({
        name: newFolderName,
        color: newFolderColor,
        icon: "📁",
      })

      setNewFolderName("")
      setNewFolderColor("Blue")
      setIsCreateDialogOpen(false)
      loadFolders()

      toast({
        title: "Folder Created",
        description: `${newFolderName} has been created`,
        variant: "default",
      })
    } catch (error) {
      console.error("Failed to create folder:", error)
      toast({
        title: "Create Failed",
        description: "Failed to create folder",
        variant: "destructive",
      })
    }
  }

  const deleteFolder = async (folderId: string, folderName: string) => {
    if (!confirm(`Are you sure you want to delete "${folderName}"? This will also delete all videos in this folder.`)) {
      return
    }

    try {
      // Delete all videos in the folder first
      const videos = await vidoDB.getVideosByFolder(folderId)
      await Promise.all(videos.map((video) => vidoDB.deleteVideo(video.id)))

      // Delete the folder
      await vidoDB.deleteFolder(folderId)
      loadFolders()

      toast({
        title: "Folder Deleted",
        description: `${folderName} has been deleted`,
        variant: "default",
      })
    } catch (error) {
      console.error("Failed to delete folder:", error)
      toast({
        title: "Delete Failed",
        description: "Failed to delete folder",
        variant: "destructive",
      })
    }
  }

  const filteredFolders = folders.filter((folder) => folder.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const FolderIcon = ({ color, size = 64 }: { color: string; size?: number }) => {
    const folderColor = FOLDER_COLORS.find((c) => c.name === color) || FOLDER_COLORS[0]

    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Folder back shadow */}
        <path
          d="M8 12C8 9.79086 9.79086 8 12 8H20L24 12H40C42.2091 12 44 13.7909 44 16V36C44 38.2091 42.2091 40 40 40H12C9.79086 40 8 38.2091 8 36V12Z"
          fill={folderColor.secondary}
          transform="translate(1, 2)"
        />
        {/* Folder main body */}
        <path
          d="M6 10C6 7.79086 7.79086 6 10 6H18L22 10H38C40.2091 10 42 11.7909 42 14V34C42 36.2091 40.2091 38 38 38H10C7.79086 38 6 36.2091 6 34V10Z"
          fill={folderColor.primary}
        />
        {/* Folder tab */}
        <path
          d="M6 10C6 7.79086 7.79086 6 10 6H18L22 10H20L18 8H10C8.89543 8 8 8.89543 8 10V12H42V14C42 11.7909 40.2091 10 38 10H22Z"
          fill={folderColor.accent}
        />
        {/* Folder highlight */}
        <path
          d="M8 10C8 8.89543 8.89543 8 10 8H18L20 10H38C39.1046 10 40 10.8954 40 12V14C40 11.7909 38.2091 10 36 10H20L18 8H10C7.79086 8 6 9.79086 6 12V32C6 34.2091 7.79086 36 10 36H38C40.2091 36 42 34.2091 42 32V14C42 11.7909 40.2091 10 38 10H22L18 6H10C7.79086 6 6 7.79086 6 10V32C6 34.2091 7.79086 36 10 36H38C40.2091 36 42 34.2091 42 32V14C42 11.7909 40.2091 10 38 10H22L18 6H10C7.79086 6 6 7.79086 6 10Z"
          fill="url(#folderGradient)"
          fillOpacity="0.3"
        />
        <defs>
          <linearGradient id="folderGradient" x1="6" y1="6" x2="42" y2="38" gradientUnits="userSpaceOnUse">
            <stop stopColor="white" stopOpacity="0.5" />
            <stop offset="1" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    )
  }

  const FolderCard = ({ folder }: { folder: Folder }) => {
    const isSelected = selectedFolderId === folder.id

    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`cursor-pointer relative group ${isSelected ? "ring-2 ring-blue-500" : ""}`}
        onClick={() => onFolderSelect(folder)}
      >
        <Card className="h-full border-2 hover:shadow-lg transition-all duration-200">
          <CardContent className="p-4 text-center relative">
            {/* Delete button */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-white/80 hover:bg-red-50 text-red-500"
              onClick={(e) => {
                e.stopPropagation()
                deleteFolder(folder.id, folder.name)
              }}
            >
              <Trash2 className="h-3 w-3" />
            </Button>

            <div className="flex justify-center mb-3">
              <FolderIcon color={folder.color} />
            </div>
            <h3 className="font-semibold text-sm mb-2 line-clamp-2">{folder.name}</h3>
            <Badge variant="secondary" className="text-xs">
              {folder.videoCount || 0} videos
            </Badge>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  const FolderListItem = ({ folder }: { folder: Folder }) => {
    const isSelected = selectedFolderId === folder.id

    return (
      <motion.div
        whileHover={{ scale: 1.01 }}
        className={`cursor-pointer ${isSelected ? "ring-2 ring-blue-500 rounded-lg" : ""}`}
        onClick={() => onFolderSelect(folder)}
      >
        <Card className="hover:shadow-md transition-all duration-200">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex justify-center">
              <FolderIcon color={folder.color} size={48} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">{folder.name}</h3>
              <p className="text-sm text-gray-500">{folder.videoCount || 0} videos</p>
            </div>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteFolder(folder.id, folder.name)
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Folder
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Your Folders</h2>
          <p className="text-gray-600">Organize your videos in beautiful folders</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search folders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full sm:w-64"
            />
          </div>
          <Button variant="outline" size="sm" onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}>
            {viewMode === "grid" ? <List className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <FolderPlus className="h-4 w-4 mr-2" />
                New Folder
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Folder</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Folder Name</label>
                  <Input
                    placeholder="Enter folder name..."
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Color</label>
                  <Select value={newFolderColor} onValueChange={setNewFolderColor}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FOLDER_COLORS.map((color) => (
                        <SelectItem key={color.name} value={color.name}>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: color.primary }} />
                            {color.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={createFolder} className="w-full" disabled={!newFolderName.trim()}>
                  Create Folder
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Folders */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredFolders.map((folder) => (
            <FolderCard key={folder.id} folder={folder} />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredFolders.map((folder) => (
            <FolderListItem key={folder.id} folder={folder} />
          ))}
        </div>
      )}

      {filteredFolders.length === 0 && (
        <div className="text-center py-12">
          <div className="flex justify-center mb-4">
            <FolderIcon color="Blue" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No folders found</h3>
          <p className="text-gray-600 mb-4">
            {searchQuery ? "Try a different search term" : "Create your first folder to get started"}
          </p>
          {!searchQuery && (
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Folder
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
