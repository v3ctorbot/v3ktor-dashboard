"use client"

import { useEffect, useState } from 'react'
import { SunIcon, MoonIcon } from '@heroicons/react/24/solid'

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light'
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'light'
  })

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') root.classList.add('dark')
    else root.classList.remove('dark')
    localStorage.setItem('theme', theme)
  }, [theme])

  return (
    <button
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md border border-gray-200 bg-white text-sm hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 transition-colors"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? <MoonIcon className="header-icon text-gray-700" /> : <SunIcon className="header-icon text-yellow-400" />}
      <span className="hidden sm:inline">{theme === 'light' ? 'Dark' : 'Light'}</span>
    </button>
  )
}
