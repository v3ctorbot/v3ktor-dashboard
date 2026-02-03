import type { Metadata } from 'next'
import './globals.css'
import Sidebar from '@/components/Sidebar'

export const metadata: Metadata = {
  title: 'V3ktor Operational Dashboard',
  description: 'Radical transparency into V3ktor\'s operations',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-klaus-bg min-h-screen text-klaus-text font-body">
        <Sidebar />
        <main className="ml-64 p-8 min-h-screen">
          {children}
        </main>
      </body>
    </html>
  )
}

