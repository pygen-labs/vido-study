"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { YoutubeIcon, FolderOpen, Settings, BookOpen, Plus, Loader2 } from "lucide-react"
import { FolderGrid } from "@/components/folder-grid"
import { FolderDetail } from "@/components/folder-detail"
import { VideoPlayer } from "@/components/video-player"
import { SettingsPage } from "@/components/settings-page"
import { vidoDB } from "@/lib/indexeddb"
import { useRouter, useSearchParams } from "next/navigation"
import { FOLDER_COLORS } from "@/lib/folder-system"
import { extractVideoId } from "@/lib/utils"

export function MainApp() {
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeView, setActiveView] = useState<"home" | "folders" | "folder-detail" | "player" | "settings">("home")
  const [selectedFolder, setSelectedFolder] = useState<any>(null)
  const [currentVideo, setCurrentVideo] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [showAddVideoDialog, setShowAddVideoDialog] = useState(false)
  const [videoUrl, setVideoUrl] = useState("")
  const [isLoadingVideo, setIsLoadingVideo] = useState(false)
  const [folders, setFolders] = useState<any[]>([])
  const [selectedFolderForVideo, setSelectedFolderForVideo] = useState<string>("")
  const [addVideoContext, setAddVideoContext] = useState<"home" | "folder">("home")

  useEffect(() => {
    initializeApp()
  }, [])

  useEffect(() => {
    // Handle URL parameters
    const view = searchParams.get("view")
    const folderId = searchParams.get("folder")
    const videoId = searchParams.get("video")

    if (view === "settings") {
      setActiveView("settings")
    } else if (folderId && videoId) {
      // Load folder and play video
      loadFolderById(folderId).then(() => {
        setCurrentVideo(videoId)
        setActiveView("player")
      })
    } else if (folderId) {
      loadFolderById(folderId)
    } else if (view === "folders") {
      setActiveView("folders")
    } else {
      setActiveView("home")
    }
  }, [searchParams])

  const initializeApp = async () => {
    try {
      await vidoDB.init()
      await loadFolders()
      setIsInitialized(true)
    } catch (error) {
      console.error("Failed to initialize app:", error)
      toast({
        title: "Initialization Error",
        description: "Failed to initialize the app. Please refresh the page.",
        variant: "destructive",
      })
    }
  }

  const loadFolders = async () => {
    try {
      const allFolders = await vidoDB.getFolders()
      setFolders(allFolders)
    } catch (error) {
      console.error("Failed to load folders:", error)
    }
  }

  const loadFolderById = async (folderId: string) => {
    try {
      const folders = await vidoDB.getFolders()
      const folder = folders.find((f) => f.id === folderId)
      if (folder) {
        setSelectedFolder(folder)
        setActiveView("folder-detail")
        return folder
      }
    } catch (error) {
      console.error("Failed to load folder:", error)
    }
    return null
  }

  const handleAddVideo = async () => {
    const targetFolderId = addVideoContext === "folder" ? selectedFolder?.id : selectedFolderForVideo

    if (!videoUrl.trim() || !targetFolderId) {
      toast({
        title: "Missing Information",
        description:
          addVideoContext === "folder" ? "Please enter a video URL" : "Please enter a video URL and select a folder",
        variant: "destructive",
      })
      return
    }

    const videoId = extractVideoId(videoUrl)
    if (!videoId) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid YouTube URL",
        variant: "destructive",
      })
      return
    }

    setIsLoadingVideo(true)

    try {
      // Fetch video info
      const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(videoUrl)}&format=json`
      const response = await fetch(oembedUrl)

      let videoInfo: any = {
        id: videoId,
        title: `YouTube Video ${videoId}`,
        thumbnail: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
        channelTitle: "Unknown Channel",
        duration: "0:00",
      }

      if (response.ok) {
        const data = await response.json()
        videoInfo = {
          id: videoId,
          title: data.title,
          thumbnail: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
          channelTitle: data.author_name,
          duration: "0:00",
        }
      }

      // Save video to folder
      await vidoDB.saveVideo({
        videoId: videoInfo.id,
        title: videoInfo.title,
        thumbnail: videoInfo.thumbnail,
        channelTitle: videoInfo.channelTitle,
        duration: videoInfo.duration,
        url: videoUrl,
        folderId: targetFolderId,
      })

      setVideoUrl("")
      setSelectedFolderForVideo("")
      setShowAddVideoDialog(false)

      // Trigger smooth refresh for folder detail view
      if (addVideoContext === "folder" && selectedFolder) {
        await loadFolderById(selectedFolder.id)
      }

      const folder = folders.find((f) => f.id === targetFolderId)
      toast({
        title: "Video Added",
        description: `Video added to ${folder?.name || "folder"}`,
        variant: "default",
      })
    } catch (error) {
      console.error("Failed to add video:", error)
      toast({
        title: "Add Failed",
        description: "Failed to add video to folder",
        variant: "destructive",
      })
    } finally {
      setIsLoadingVideo(false)
    }
  }

  const handleFolderSelect = (folder: any) => {
    setSelectedFolder(folder)
    setActiveView("folder-detail")
    router.push(`?folder=${folder.id}`)
  }

  const handleVideoSelect = (videoId: string) => {
    console.log("Video selected:", videoId, "Folder:", selectedFolder?.id) // Debug log
    if (!selectedFolder) {
      console.error("No folder selected!")
      return
    }

    setCurrentVideo(videoId)
    setActiveView("player")
    router.push(`?folder=${selectedFolder.id}&video=${videoId}`)
  }

  const handleBackToFolders = () => {
    setSelectedFolder(null)
    setCurrentVideo(null)
    setActiveView("folders")
    router.push("?view=folders")
  }

  const handleBackToHome = () => {
    setCurrentVideo(null)
    setActiveView("home")
    router.push("?view=app")
  }

  const handleBackToFolder = () => {
    setCurrentVideo(null)
    setActiveView("folder-detail")
    if (selectedFolder) {
      router.push(`?folder=${selectedFolder.id}`)
    }
  }

  const handleSettingsClick = () => {
    setActiveView("settings")
    router.push("?view=settings")
  }

  const handleAddVideoFromHome = () => {
    setAddVideoContext("home")
    setSelectedFolderForVideo("")
    setShowAddVideoDialog(true)
  }

  const handleAddVideoFromFolder = () => {
    setAddVideoContext("folder")
    setShowAddVideoDialog(true)
  }

  const getFolderColor = (colorName: string) => {
    const color = FOLDER_COLORS.find((c) => c.name === colorName)
    return color ? color.primary : "#2196F3"
  }

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Initializing Vido Study...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {activeView === "player" && currentVideo && selectedFolder ? (
        <VideoPlayer videoId={currentVideo} folderId={selectedFolder.id} onClose={handleBackToFolder} />
      ) : (
        <>
          {/* Header */}
          <header className="bg-white border-b sticky top-0 z-50">
            <div className="container mx-auto py-3 px-4 flex justify-between items-center">
              <div className="flex items-center gap-6">
                <button
                  onClick={handleBackToHome}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                  <div className="relative h-8 w-8">
                    <YoutubeIcon className="h-8 w-8 text-red-500" />
                    <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-0.5">
                      <BookOpen className="h-2 w-2 text-white" />
                    </div>
                  </div>
                  <span className="text-xl font-bold">Vido Study</span>
                </button>

                {/* Navigation */}
                <nav className="hidden md:flex items-center gap-2">
                  <Button
                    variant={activeView === "folders" || activeView === "folder-detail" ? "default" : "ghost"}
                    onClick={() => {
                      setActiveView("folders")
                      router.push("?view=folders")
                    }}
                    size="sm"
                    className="rounded-full"
                  >
                    <FolderOpen className="h-4 w-4 mr-2" />
                    Folders
                  </Button>
                </nav>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={handleSettingsClick} className="rounded-full">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </header>

          <main className="container mx-auto px-4 py-6 max-w-7xl">
            {activeView === "home" && (
              <div className="space-y-8">
                {/* Hero Section */}
                <div className="text-center py-8 lg:py-16">
                  <h1 className="text-3xl lg:text-5xl font-bold mb-4">
                    Your YouTube <span className="text-blue-600">Study Hub</span>
                  </h1>
                  <p className="text-lg lg:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                    Organize videos, take smart notes, save moments, and create beautiful study collections
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                      onClick={() => {
                        setActiveView("folders")
                        router.push("?view=folders")
                      }}
                      size="lg"
                      className="rounded-full bg-blue-600 text-white hover:bg-blue-700"
                    >
                      <FolderOpen className="h-5 w-5 mr-2" />
                      Browse Folders
                    </Button>
                    <Button onClick={handleAddVideoFromHome} size="lg" variant="outline" className="rounded-full">
                      <Plus className="h-5 w-5 mr-2" />
                      Add Video
                    </Button>
                  </div>
                </div>

                {/* Features */}
                <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                  <div className="text-center p-6 bg-white rounded-xl shadow-sm border">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold mb-2">Smart Notes</h3>
                    <p className="text-sm text-gray-600">Take timestamped notes while watching videos</p>
                  </div>
                  <div className="text-center p-6 bg-white rounded-xl shadow-sm border">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="h-6 w-6 text-purple-600" />
                    </div>
                    <h3 className="font-semibold mb-2">Save Moments</h3>
                    <p className="text-sm text-gray-600">Bookmark important moments with tags and notes</p>
                  </div>
                  <div className="text-center p-6 bg-white rounded-xl shadow-sm border">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <FolderOpen className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="font-semibold mb-2">Organize</h3>
                    <p className="text-sm text-gray-600">Beautiful folders to organize your study materials</p>
                  </div>
                </div>
              </div>
            )}

            {activeView === "folders" && (
              <FolderGrid onFolderSelect={handleFolderSelect} selectedFolderId={selectedFolder?.id} />
            )}

            {activeView === "folder-detail" && selectedFolder && (
              <FolderDetail
                folder={selectedFolder}
                onBack={handleBackToFolders}
                onVideoSelect={handleVideoSelect}
                onAddVideo={handleAddVideoFromFolder}
              />
            )}

            {activeView === "settings" && <SettingsPage />}
          </main>

          {/* Add Video Dialog */}
          <Dialog open={showAddVideoDialog} onOpenChange={setShowAddVideoDialog}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add Video to Folder</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">YouTube URL</label>
                  <Input
                    placeholder="Paste YouTube video URL here..."
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    className="mt-1"
                  />
                </div>

                {/* Only show folder selector when adding from home */}
                {addVideoContext === "home" && (
                  <div>
                    <label className="text-sm font-medium">Select Folder</label>
                    <Select value={selectedFolderForVideo} onValueChange={setSelectedFolderForVideo}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Choose a folder..." />
                      </SelectTrigger>
                      <SelectContent>
                        {folders.map((folder) => (
                          <SelectItem key={folder.id} value={folder.id}>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-4 h-4 rounded"
                                style={{ backgroundColor: getFolderColor(folder.color) }}
                              />
                              {folder.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Show current folder when adding from folder detail */}
                {addVideoContext === "folder" && selectedFolder && (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800">
                      Adding to: <strong>{selectedFolder.name}</strong>
                    </p>
                  </div>
                )}

                {/* Show selected folder when adding from home */}
                {addVideoContext === "home" && selectedFolderForVideo && (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800">
                      Adding to: <strong>{folders.find((f) => f.id === selectedFolderForVideo)?.name}</strong>
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    onClick={handleAddVideo}
                    disabled={
                      !videoUrl.trim() || (addVideoContext === "home" && !selectedFolderForVideo) || isLoadingVideo
                    }
                    className="flex-1 rounded-full"
                  >
                    {isLoadingVideo ? (
                      <div className="flex items-center">
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Adding...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Video
                      </div>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowAddVideoDialog(false)
                      setVideoUrl("")
                      setSelectedFolderForVideo("")
                    }}
                    className="rounded-full"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  )
}
