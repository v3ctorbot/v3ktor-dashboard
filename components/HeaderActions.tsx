"use client"

import ThemeToggle from './ThemeToggle'
import { ArrowPathIcon } from '@heroicons/react/24/outline'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

export default function HeaderActions() {
  const handleRefresh = () => {
    if (typeof window !== 'undefined') window.dispatchEvent(new Event('v3ktor:refresh'))
  }

  return (
    <div className="flex items-center gap-3">
      <button onClick={handleRefresh} className="btn">
        <ArrowPathIcon className="w-5 h-5" />
        <span className="hidden sm:inline">Refresh</span>
      </button>

      {supabaseUrl ? (
        <a
          href={supabaseUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-3 py-1.5 rounded-md border border-gray-200 text-sm text-ft-dark bg-white hover:bg-gray-50"
        >
          Supabase
        </a>
      ) : (
        <span className="text-sm text-gray-400">Supabase not configured</span>
      )}

      <ThemeToggle />
    </div>
  )
}
