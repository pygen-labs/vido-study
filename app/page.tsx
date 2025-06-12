"use client"

import { useEffect, useState } from "react"
import { LandingPage } from "@/components/landing-page"
import { MainApp } from "@/components/main-app"
import { InstallPrompt } from "@/components/install-prompt"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { useRouter, useSearchParams } from "next/navigation"

export default function Home() {
  const [showLanding, setShowLanding] = useLocalStorage("vido-landing-shown", true)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Check if the app is already installed
    const isInStandaloneMode = () =>
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone ||
      document.referrer.includes("android-app://")

    setIsStandalone(isInStandaloneMode())

    // Show install prompt if not in standalone mode and not shown before
    if (!isInStandaloneMode()) {
      const hasShownPrompt = localStorage.getItem("vido-install-prompt-shown")
      if (!hasShownPrompt) {
        // Show prompt after 30 seconds
        const timer = setTimeout(() => {
          setShowInstallPrompt(true)
        }, 30000)

        return () => clearTimeout(timer)
      }
    }

    // Handle URL parameters for routing
    const view = searchParams.get("view")
    const folderId = searchParams.get("folder")

    if (view === "app" || folderId) {
      setShowLanding(false)
    }
  }, [searchParams, setShowLanding])

  const handleDismissLanding = () => {
    setShowLanding(false)
    router.push("?view=app")
  }

  const handleDismissInstallPrompt = () => {
    setShowInstallPrompt(false)
    localStorage.setItem("vido-install-prompt-shown", "true")
  }

  if (showLanding) {
    return <LandingPage onDismiss={handleDismissLanding} />
  }

  return (
    <>
      <MainApp />
      {showInstallPrompt && !isStandalone && <InstallPrompt onDismiss={handleDismissInstallPrompt} />}
    </>
  )
}
