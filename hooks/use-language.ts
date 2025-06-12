"use client"

import { useState, useEffect } from "react"

export function useLanguage() {
  const [language, setLanguage] = useState("en")

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem("vido-language")
    if (savedLanguage) {
      setLanguage(savedLanguage)
    }
  }, [])

  // Save language to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("vido-language", language)
  }, [language])

  return {
    language,
    setLanguage,
  }
}
