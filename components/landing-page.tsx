"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { YoutubeIcon, BookOpen, Clock, FolderOpen, ArrowRight, ExternalLink } from "lucide-react"

interface LandingPageProps {
  onDismiss: () => void
}

export function LandingPage({ onDismiss }: LandingPageProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const projects = [
    { name: "ProjXs", url: "https://projxs.pygen.in", description: "Project Management" },
    { name: "OpenSpace", url: "https://openspace.pygen.in", description: "Collaboration Platform" },
    { name: "NexDrop", url: "https://nexdrop.pygen.in", description: "File Sharing" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col">
      <header className="container mx-auto py-6 px-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="relative h-10 w-10">
            <YoutubeIcon className="h-10 w-10 text-red-500" />
            <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1">
              <BookOpen className="h-3 w-3 text-white" />
            </div>
          </div>
          <span className="text-2xl font-bold">Vido Study</span>
        </div>
        <Button onClick={onDismiss} className="rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-all">
          Get Started
        </Button>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Transform YouTube into <br />
              <span className="text-blue-600">Your Study Space</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-8">
              Organize videos, take smart notes, save moments, and create beautiful study collections with our premium
              learning platform.
            </p>
            <Button
              onClick={onDismiss}
              size="lg"
              className="rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-all px-8 py-6 text-lg"
            >
              Start Learning Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="grid md:grid-cols-3 gap-8 mb-16"
          >
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <BookOpen className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-4">Smart Notes</h3>
              <p className="text-gray-600">
                Take timestamped notes while watching. Never lose track of important information again.
              </p>
            </div>
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <Clock className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-4">Save Moments</h3>
              <p className="text-gray-600">
                Bookmark key moments with tags and notes. Jump back to any timestamp instantly.
              </p>
            </div>
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <FolderOpen className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-4">Beautiful Organization</h3>
              <p className="text-gray-600">
                Create stunning folders with custom colors and icons. Keep your studies organized.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-gray-100"
          >
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">Perfect for Students & Researchers</h2>
                <ul className="space-y-4 text-gray-600">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    Organize lecture videos by subject
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    Take detailed notes with timestamps
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    Save important moments for review
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    Create beautiful study collections
                  </li>
                </ul>
              </div>
              <div className="relative">
                <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl overflow-hidden shadow-lg flex items-center justify-center">
                  <div className="text-center">
                    <YoutubeIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">Your Study Dashboard</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <footer className="container mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <p className="text-gray-600 mb-2">Built with ❤️ by PyGen Labs</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              {projects.map((project) => (
                <a
                  key={project.name}
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 transition-colors"
                >
                  {project.name}
                  <ExternalLink className="h-3 w-3" />
                </a>
              ))}
            </div>
          </div>
          <Button onClick={onDismiss} className="rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-all">
            Start Your Journey
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </footer>
    </div>
  )
}
