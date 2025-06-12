"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { User, Save, ExternalLink, Trash2, Download } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { vidoDB } from "@/lib/indexeddb"

interface UserSettings {
  username: string
  email: string
  createdAt: string
}

export function SettingsPage() {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [stats, setStats] = useState({
    totalFolders: 0,
    totalVideos: 0,
    totalNotes: 0,
    totalMoments: 0,
  })

  const { toast } = useToast()

  useEffect(() => {
    loadSettings()
    loadStats()
  }, [])

  const loadSettings = async () => {
    try {
      const savedSettings = localStorage.getItem("vido-user-settings")
      if (savedSettings) {
        const settings: UserSettings = JSON.parse(savedSettings)
        setUsername(settings.username || "")
        setEmail(settings.email || "")
      }
    } catch (error) {
      console.error("Failed to load settings:", error)
    }
  }

  const loadStats = async () => {
    try {
      const [folders, videos, notes, moments] = await Promise.all([
        vidoDB.getFolders(),
        vidoDB.getAllVideos(),
        vidoDB.getAllNotes(),
        vidoDB.getAllMoments(),
      ])

      setStats({
        totalFolders: folders.length,
        totalVideos: videos.length,
        totalNotes: notes.length,
        totalMoments: moments.length,
      })
    } catch (error) {
      console.error("Failed to load stats:", error)
    }
  }

  const saveSettings = async () => {
    if (!username.trim()) {
      toast({
        title: "Username Required",
        description: "Please enter a username",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const settings: UserSettings = {
        username: username.trim(),
        email: email.trim(),
        createdAt: new Date().toISOString(),
      }

      localStorage.setItem("vido-user-settings", JSON.stringify(settings))

      toast({
        title: "Settings Saved",
        description: "Your settings have been saved successfully",
        variant: "default",
      })
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save settings",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const exportData = async () => {
    try {
      const [folders, videos, notes, moments] = await Promise.all([
        vidoDB.getFolders(),
        vidoDB.getAllVideos(),
        vidoDB.getAllNotes(),
        vidoDB.getAllMoments(),
      ])

      const exportData = {
        folders,
        videos,
        notes,
        moments,
        exportedAt: new Date().toISOString(),
        version: "1.0",
      }

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `vido-study-backup-${new Date().toISOString().split("T")[0]}.json`
      a.click()
      URL.revokeObjectURL(url)

      toast({
        title: "Data Exported",
        description: "Your study data has been exported successfully",
        variant: "default",
      })
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export data",
        variant: "destructive",
      })
    }
  }

  const clearAllData = async () => {
    if (!confirm("Are you sure you want to clear all data? This action cannot be undone.")) {
      return
    }

    try {
      await vidoDB.clearAllData()
      loadStats()

      toast({
        title: "Data Cleared",
        description: "All study data has been cleared",
        variant: "default",
      })
    } catch (error) {
      toast({
        title: "Clear Failed",
        description: "Failed to clear data",
        variant: "destructive",
      })
    }
  }

  const projects = [
    { name: "ProjXs", url: "https://projxs.pygen.in", description: "Project Management Platform" },
    { name: "OpenSpace", url: "https://openspace.pygen.in", description: "Collaboration Hub" },
    { name: "NexDrop", url: "https://nexdrop.pygen.in", description: "File Sharing Service" },
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-gray-600">Manage your account and study preferences</p>
      </div>

      {/* User Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            User Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="email">Email (Optional)</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          <Button onClick={saveSettings} disabled={isLoading} className="rounded-full">
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? "Saving..." : "Save Settings"}
          </Button>
        </CardContent>
      </Card>

      {/* Study Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Study Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <div className="text-2xl font-bold text-blue-600">{stats.totalFolders}</div>
              <div className="text-sm text-gray-600">Folders</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <div className="text-2xl font-bold text-green-600">{stats.totalVideos}</div>
              <div className="text-sm text-gray-600">Videos</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-xl">
              <div className="text-2xl font-bold text-purple-600">{stats.totalNotes}</div>
              <div className="text-sm text-gray-600">Notes</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-xl">
              <div className="text-2xl font-bold text-orange-600">{stats.totalMoments}</div>
              <div className="text-sm text-gray-600">Moments</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={exportData} variant="outline" className="rounded-full">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
            <Button onClick={clearAllData} variant="destructive" className="rounded-full">
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All Data
            </Button>
          </div>
          <p className="text-sm text-gray-600">Export your study data as a backup or clear all data to start fresh.</p>
        </CardContent>
      </Card>

      {/* PyGen Labs Projects */}
      <Card>
        <CardHeader>
          <CardTitle>More from PyGen Labs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {projects.map((project) => (
              <a
                key={project.name}
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 border rounded-xl hover:shadow-md transition-all group"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold group-hover:text-blue-600 transition-colors">{project.name}</h3>
                  <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                </div>
                <p className="text-sm text-gray-600">{project.description}</p>
              </a>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardHeader>
          <CardTitle>About Vido Study</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-600">
              Vido Study is a premium YouTube learning platform designed for students and researchers. Transform any
              YouTube video into organized study materials with smart notes, moments, and beautiful folders.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">Version 1.0</Badge>
              <Badge variant="secondary">PWA Ready</Badge>
              <Badge variant="secondary">Offline Support</Badge>
            </div>
            <p className="text-sm text-gray-500">
              Built with ❤️ by PyGen Labs • All data stored locally in your browser
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
