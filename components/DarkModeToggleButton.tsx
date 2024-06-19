"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { MdDarkMode, MdLightMode } from "react-icons/md"

export default function DarkModeToggleButton() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div>
      <button
        className="rounded-xl p-2 hover:bg-gray-300 hover:shadow-md active:shadow-sm dark:hover:bg-neutral-800 dark:hover:shadow-neutral-700 dark:hover:shadow-md dark:active:shadow-sm"
        type="button"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      >
        {theme === "light" ? (
          <MdLightMode className="text-[28px]" />
        ) : (
          <MdDarkMode className="text-[28px]" />
        )}
      </button>
    </div>
  )
}
