"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ArrowLeft, Clock, Save, BookOpen, Tag, Edit3, Trash2, Eye, Calendar, ThumbsUp, Share2 } from "lucide-react"
import { vidoDB } from "@/lib/indexeddb"
import { useToast } from "@/components/ui/use-toast"
import { formatTime, parseTimeToSeconds, validateTimeFormat } from "@/lib/utils"

interface VideoPlayerProps {
  videoId: string
  folderId: string
  onClose: () => void
}

interface VideoMoment {
  id: string
  timestamp: number
  title: string
  note: string
  tags: string[]
}

interface VideoNote {
  id: string
  content: string
  timestamp?: number
  createdAt: string
  updatedAt: string
}

interface VideoInfo {
  title: string
  channelTitle: string
  viewCount: string
  publishedAt: string
  description: string
}

export function VideoPlayer({ videoId, folderId, onClose }: VideoPlayerProps) {
  const [moments, setMoments] = useState<VideoMoment[]>([])
  const [notes, setNotes] = useState<VideoNote[]>([])
  const [currentNote, setCurrentNote] = useState("")
  const [momentTitle, setMomentTitle] = useState("")
  const [momentNote, setMomentNote] = useState("")
  const [momentTags, setMomentTags] = useState("")
  const [momentTimestamp, setMomentTimestamp] = useState("0:00")
  const [currentTime, setCurrentTime] = useState(0)
  const [activeTab, setActiveTab] = useState<"notes" | "moments">("notes")
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null)
  const [editingNote, setEditingNote] = useState<VideoNote | null>(null)
  const [editNoteContent, setEditNoteContent] = useState("")

  const iframeRef = useRef<HTMLIFrameElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadVideoData()
    fetchVideoInfo()

    // Listen for YouTube player time updates
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== "https://www.youtube.com") return

      try {
        const data = JSON.parse(event.data)
        if (data.event === "video-progress" && data.info?.currentTime) {
          const time = Math.floor(data.info.currentTime)
          setCurrentTime(time)
          setMomentTimestamp(formatTime(time))
        }
      } catch (e) {
        // Ignore parsing errors
      }
    }

    window.addEventListener("message", handleMessage)

    // Poll for current time every second
    const timeInterval = setInterval(() => {
      if (iframeRef.current) {
        try {
          iframeRef.current.contentWindow?.postMessage('{"event":"command","func":"getCurrentTime","args":""}', "*")
        } catch (e) {
          // Fallback: increment time manually
          setCurrentTime((prev) => {
            const newTime = prev + 1
            setMomentTimestamp(formatTime(newTime))
            return newTime
          })
        }
      }
    }, 1000)

    return () => {
      window.removeEventListener("message", handleMessage)
      clearInterval(timeInterval)
    }
  }, [videoId])

  const loadVideoData = async () => {
    try {
      const [videoMoments, videoNotes] = await Promise.all([
        vidoDB.getMomentsByVideo(videoId),
        vidoDB.getNotesByVideo(videoId),
      ])

      setMoments(videoMoments)
      setNotes(videoNotes)
    } catch (error) {
      console.error("Failed to load video data:", error)
    }
  }

  const fetchVideoInfo = async () => {
    try {
      const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
      const response = await fetch(oembedUrl)

      if (response.ok) {
        const data = await response.json()
        setVideoInfo({
          title: data.title,
          channelTitle: data.author_name,
          viewCount: "N/A",
          publishedAt: "N/A",
          description: "",
        })
      }
    } catch (error) {
      console.error("Failed to fetch video info:", error)
    }
  }

  const saveMoment = async () => {
    if (!momentTitle.trim()) {
      toast({
        title: "Title Required",
        description: "Please enter a title for this moment",
        variant: "destructive",
      })
      return
    }

    try {
      const tags = momentTags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)

      const timestamp = parseTimeToSeconds(momentTimestamp)

      await vidoDB.saveMoment({
        videoId,
        timestamp,
        title: momentTitle,
        note: momentNote,
        tags,
        folderId,
      })

      setMomentTitle("")
      setMomentNote("")
      setMomentTags("")
      // Reset timestamp to current time
      setMomentTimestamp(formatTime(currentTime))
      loadVideoData()

      toast({
        title: "Moment Saved",
        description: `Moment saved at ${formatTime(timestamp)}`,
        variant: "default",
      })
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save moment",
        variant: "destructive",
      })
    }
  }

  const saveNote = async () => {
    if (!currentNote.trim()) return

    try {
      await vidoDB.saveNote({
        videoId,
        content: currentNote,
        folderId,
      })

      setCurrentNote("")
      loadVideoData()

      toast({
        title: "Note Saved",
        description: "Your note has been saved",
        variant: "default",
      })
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save note",
        variant: "destructive",
      })
    }
  }

  const updateNote = async () => {
    if (!editingNote || !editNoteContent.trim()) return

    try {
      await vidoDB.updateNote(editingNote.id, editNoteContent)
      setEditingNote(null)
      setEditNoteContent("")
      loadVideoData()

      toast({
        title: "Note Updated",
        description: "Your note has been updated",
        variant: "default",
      })
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update note",
        variant: "destructive",
      })
    }
  }

  const deleteNote = async (noteId: string) => {
    if (!confirm("Are you sure you want to delete this note?")) return

    try {
      await vidoDB.deleteNote(noteId)
      loadVideoData()

      toast({
        title: "Note Deleted",
        description: "Note has been deleted",
        variant: "default",
      })
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: "Failed to delete note",
        variant: "destructive",
      })
    }
  }

  const jumpToMoment = (timestamp: number) => {
    // Send message to YouTube iframe to seek to timestamp
    if (iframeRef.current) {
      const message = {
        event: "command",
        func: "seekTo",
        args: [timestamp, true],
      }
      iframeRef.current.contentWindow?.postMessage(JSON.stringify(message), "*")
    }
    setCurrentTime(timestamp)
    setMomentTimestamp(formatTime(timestamp))
  }

  const setCurrentTimeAsMoment = () => {
    setMomentTimestamp(formatTime(currentTime))
  }

  const formatDate = (dateString: string) => {
    if (dateString === "N/A") return dateString
    return new Date(dateString).toLocaleDateString()
  }

  const formatViewCount = (count: string) => {
    if (count === "N/A") return count
    const num = Number.parseInt(count)
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M views`
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K views`
    }
    return `${num} views`
  }

  const handleTimestampChange = (value: string) => {
    setMomentTimestamp(value)
  }

  return (
    <div className="h-screen flex flex-col lg:flex-row bg-gray-50">
      {/* Video Player Section */}
      <div className="flex-1 flex flex-col bg-black">
        {/* Back Button */}
        <div className="absolute top-4 left-4 z-10">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="rounded-full bg-black/50 text-white hover:bg-black/70"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </div>

        {/* YouTube Player */}
        <div className="flex-1 relative">
          <iframe
            ref={iframeRef}
            src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1&origin=${window.location.origin}&rel=0&modestbranding=1`}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        {/* Video Info */}
        <div className="bg-white p-4 lg:p-6">
          <h1 className="text-xl lg:text-2xl font-bold mb-2 line-clamp-2">{videoInfo?.title || "Loading..."}</h1>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="font-medium">{videoInfo?.channelTitle || "Loading..."}</span>
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {formatViewCount(videoInfo?.viewCount || "N/A")}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDate(videoInfo?.publishedAt || "N/A")}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" className="rounded-full">
                <ThumbsUp className="h-4 w-4 mr-1" />
                Like
              </Button>
              <Button size="sm" variant="outline" className="rounded-full">
                <Share2 className="h-4 w-4 mr-1" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Notes & Moments Sidebar */}
      <div className="w-full lg:w-96 bg-white border-l flex flex-col max-h-screen lg:h-screen">
        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab("notes")}
            className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "notes"
                ? "border-blue-500 text-blue-600 bg-blue-50"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <BookOpen className="h-4 w-4 inline mr-2" />
            Notes
          </button>
          <button
            onClick={() => setActiveTab("moments")}
            className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "moments"
                ? "border-blue-500 text-blue-600 bg-blue-50"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Clock className="h-4 w-4 inline mr-2" />
            Moments
          </button>
        </div>

        <div className="flex-1 overflow-hidden">
          {activeTab === "notes" && (
            <div className="h-full flex flex-col">
              {/* Note Input */}
              <div className="p-4 border-b bg-gray-50">
                <Textarea
                  placeholder="Write your notes here..."
                  value={currentNote}
                  onChange={(e) => setCurrentNote(e.target.value)}
                  className="mb-3 min-h-[100px] resize-none"
                />
                <Button onClick={saveNote} className="w-full rounded-full" disabled={!currentNote.trim()}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Note
                </Button>
              </div>

              {/* Notes List */}
              <ScrollArea className="flex-1">
                <div className="p-4 space-y-4">
                  {notes.map((note) => (
                    <Card key={note.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <p className="text-sm whitespace-pre-wrap mb-3">{note.content}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{new Date(note.createdAt).toLocaleString()}</span>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0"
                              onClick={() => {
                                setEditingNote(note)
                                setEditNoteContent(note.content)
                              }}
                            >
                              <Edit3 className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0 text-red-500"
                              onClick={() => deleteNote(note.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {notes.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No notes yet</p>
                      <p className="text-sm">Start taking notes above</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          )}

          {activeTab === "moments" && (
            <div className="h-full flex flex-col">
              {/* Moment Input */}
              <div className="p-4 border-b bg-gray-50 space-y-3">
                <Input
                  placeholder="Moment title..."
                  value={momentTitle}
                  onChange={(e) => setMomentTitle(e.target.value)}
                />
                <Textarea
                  placeholder="Add a note for this moment..."
                  value={momentNote}
                  onChange={(e) => setMomentNote(e.target.value)}
                  className="min-h-[80px] resize-none"
                />
                <Input
                  placeholder="Tags (comma separated)"
                  value={momentTags}
                  onChange={(e) => setMomentTags(e.target.value)}
                />

                {/* Editable Timestamp */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Timestamp</label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="0:00"
                        value={momentTimestamp}
                        onChange={(e) => handleTimestampChange(e.target.value)}
                        className={`pl-10 ${!validateTimeFormat(momentTimestamp) ? "border-red-300" : ""}`}
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={setCurrentTimeAsMoment}
                      className="rounded-full whitespace-nowrap"
                    >
                      Use Current
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Format: 1:23 (minutes:seconds) or 1:23:45 (hours:minutes:seconds)
                  </p>
                  {!validateTimeFormat(momentTimestamp) && (
                    <p className="text-xs text-red-500">Invalid time format. Use 1:23 or 1:23:45</p>
                  )}
                </div>

                <Button
                  onClick={saveMoment}
                  disabled={!momentTitle.trim() || !validateTimeFormat(momentTimestamp)}
                  className="w-full rounded-full"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Moment
                </Button>
              </div>

              {/* Moments List */}
              <ScrollArea className="flex-1">
                <div className="p-4 space-y-4">
                  {moments.map((moment) => (
                    <Card
                      key={moment.id}
                      className="border-l-4 border-l-purple-500 cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => jumpToMoment(moment.timestamp)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium">{moment.title}</h4>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {formatTime(moment.timestamp)}
                          </span>
                        </div>
                        {moment.note && <p className="text-sm text-gray-600 mb-3">{moment.note}</p>}
                        {moment.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {moment.tags.map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                <Tag className="h-3 w-3 mr-1" />
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}

                  {moments.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No moments saved</p>
                      <p className="text-sm">Save important moments while watching</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      </div>

      {/* Edit Note Dialog */}
      <Dialog open={!!editingNote} onOpenChange={() => setEditingNote(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Note</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={editNoteContent}
              onChange={(e) => setEditNoteContent(e.target.value)}
              className="min-h-[150px]"
              placeholder="Edit your note..."
            />
            <div className="flex gap-2">
              <Button onClick={updateNote} disabled={!editNoteContent.trim()}>
                <Save className="h-4 w-4 mr-2" />
                Update Note
              </Button>
              <Button variant="outline" onClick={() => setEditingNote(null)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
