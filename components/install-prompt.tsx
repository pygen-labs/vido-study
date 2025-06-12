"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { X, Smartphone, Download } from "lucide-react"

interface InstallPromptProps {
  onDismiss: () => void
}

export function InstallPrompt({ onDismiss }: InstallPromptProps) {
  const [isVisible, setIsVisible] = useState(true)

  const handleDismiss = () => {
    setIsVisible(false)
    setTimeout(onDismiss, 300)
  }

  const handleInstall = () => {
    // Check if PWA can be installed
    if ("serviceWorker" in navigator) {
      // Show browser-specific install instructions
      const userAgent = navigator.userAgent.toLowerCase()
      let instructions = ""

      if (userAgent.includes("chrome")) {
        instructions = "Tap the menu (⋮) and select 'Add to Home screen' or 'Install app'"
      } else if (userAgent.includes("firefox")) {
        instructions = "Tap the menu and select 'Install' or 'Add to Home screen'"
      } else if (userAgent.includes("safari")) {
        instructions = "Tap the Share button and select 'Add to Home Screen'"
      } else {
        instructions = "Look for 'Add to Home screen' or 'Install' in your browser menu"
      }

      alert(`To install Vido Study:\n\n${instructions}`)
    }
    handleDismiss()
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ type: "spring", damping: 20 }}
          className="fixed bottom-4 left-4 right-4 z-50 max-w-sm mx-auto"
        >
          <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mr-3">
                  <Smartphone className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Install Vido Study</h3>
                  <p className="text-sm text-gray-600">Get the app experience</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={handleDismiss} className="rounded-full h-8 w-8 p-0">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Works offline
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Faster loading
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Home screen access
              </div>
            </div>

            <Button onClick={handleInstall} className="w-full rounded-xl bg-blue-600 hover:bg-blue-700">
              <Download className="h-4 w-4 mr-2" />
              Install App
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
