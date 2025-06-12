"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, Search, Play, Clock, Eye, Calendar, Trash2 } from "lucide-react"
import { vidoDB } from "@/lib/indexeddb"
import { useToast } from "@/components/ui/use-toast"
import { FOLDER_COLORS } from "@/lib/folder-system"
import { formatDuration } from "@/lib/utils"

interface SavedVideo {
  id: string
  videoId: string
  title: string
  thumbnail: string
  channelTitle: string
  duration: string
  url: string
  savedAt: string
  lastWatched?: string
  watchProgress?: number
  viewCount?: string
  publishedAt?: string
}

interface FolderDetailProps {
  folder: any
  onBack: () => void
  onVideoSelect: (videoId: string) => void
  onAddVideo: () => void
}

export function FolderDetail({ folder, onBack, onVideoSelect, onAddVideo }: FolderDetailProps) {
  const [videos, setVideos] = useState<SavedVideo[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  const loadVideos = useCallback(async () => {
    try {
      setIsLoading(true)
      const folderVideos = await vidoDB.getVideosByFolder(folder.id)
      setVideos(folderVideos)
    } catch (error) {
      console.error("Failed to load videos:", error)
      toast({
        title: "Error",
        description: "Failed to load videos",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [folder.id, toast])

  useEffect(() => {
    loadVideos()
  }, [loadVideos])

  const deleteVideo = async (videoId: string) => {
    if (!confirm("Are you sure you want to remove this video from the folder?")) {
      return
    }

    try {
      await vidoDB.deleteVideo(videoId)
      setVideos((prev) => prev.filter((video) => video.id !== videoId))
      toast({
        title: "Video Removed",
        description: "Video has been removed from the folder",
        variant: "default",
      })
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: "Failed to remove video",
        variant: "destructive",
      })
      loadVideos()
    }
  }

  const handleVideoClick = (video: SavedVideo) => {
    console.log("Video clicked:", video.videoId) // Debug log
    onVideoSelect(video.videoId)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const filteredVideos = videos.filter((video) => video.title.toLowerCase().includes(searchQuery.toLowerCase()))

  const FolderIcon = ({ color, size = 48 }: { color: string; size?: number }) => {
    const folderColor = FOLDER_COLORS.find((c) => c.name === color) || FOLDER_COLORS[0]

    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M8 12C8 9.79086 9.79086 8 12 8H20L24 12H40C42.2091 12 44 13.7909 44 16V36C44 38.2091 42.2091 40 40 40H12C9.79086 40 8 38.2091 8 36V12Z"
          fill={folderColor.secondary}
          transform="translate(1, 2)"
        />
        <path
          d="M6 10C6 7.79086 7.79086 6 10 6H18L22 10H38C40.2091 10 42 11.7909 42 14V34C42 36.2091 40.2091 38 38 38H10C7.79086 38 6 36.2091 6 34V10Z"
          fill={folderColor.primary}
        />
        <path
          d="M6 10C6 7.79086 7.79086 6 10 6H18L22 10H20L18 8H10C8.89543 8 8 8.89543 8 10V12H42V14C42 11.7909 40.2091 10 38 10H22Z"
          fill={folderColor.accent}
        />
        <path
          d="M8 10C8 8.89543 8.89543 8 10 8H18L20 10H38C39.1046 10 40 10.8954 40 12V14C40 11.7909 38.2091 10 36 10H20L18 8H10C7.79086 8 6 9.79086 6 12V32C6 34.2091 7.79086 36 10 36H38C40.2091 36 42 34.2091 42 32V14C42 11.7909 40.2091 10 38 10H22L18 6H10C7.79086 6 6 7.79086 6 10Z"
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack} className="rounded-full self-start">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-4 flex-1">
          <FolderIcon color={folder.color} />
          <div>
            <h1 className="text-2xl font-bold">{folder.name}</h1>
            <p className="text-gray-600">{videos.length} videos</p>
          </div>
        </div>
        <Button onClick={onAddVideo} className="rounded-full">
          <Plus className="h-4 w-4 mr-2" />
          Add Video
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search videos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 rounded-full"
        />
      </div>

      {/* Videos Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-0">
                <div className="aspect-video bg-gray-200 rounded-t-lg"></div>
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredVideos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredVideos.map((video) => (
            <Card
              key={video.id}
              className="group hover:shadow-lg transition-all duration-200 cursor-pointer"
              onClick={() => handleVideoClick(video)}
            >
              <CardContent className="p-0">
                <div className="relative aspect-video bg-gray-100 rounded-t-lg overflow-hidden">
                  <img
                    src={video.thumbnail || `/placeholder.svg?height=180&width=320`}
                    alt={video.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = `https://i.ytimg.com/vi/${video.videoId}/hqdefault.jpg`
                    }}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-all duration-200 rounded-full bg-white/90 text-black hover:bg-white p-3">
                      <Play className="h-6 w-6" />
                    </div>
                  </div>
                  {video.duration && (
                    <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                      {formatDuration(video.duration)}
                    </div>
                  )}
                  {video.watchProgress && video.watchProgress > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-300">
                      <div
                        className="h-full bg-red-500"
                        style={{ width: `${Math.min(video.watchProgress, 100)}%` }}
                      ></div>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
                    {video.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">{video.channelTitle}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-3">
                      {video.viewCount && (
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {video.viewCount}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(video.savedAt)}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteVideo(video.id)
                      }}
                    >
                      <Trash2 className="h-3 w-3 text-red-500" />
                    </Button>
                  </div>
                  {video.lastWatched && (
                    <div className="mt-2">
                      <Badge variant="secondary" className="text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        Last watched {formatDate(video.lastWatched)}
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <FolderIcon color={folder.color} size={64} />
          <h3 className="text-lg font-semibold mb-2 mt-4">
            {searchQuery ? "No videos found" : "No videos in this folder"}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchQuery ? "Try a different search term" : "Add your first video to get started"}
          </p>
          {!searchQuery && (
            <Button onClick={onAddVideo} className="rounded-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Video
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
