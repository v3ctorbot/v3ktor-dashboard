import type { Metadata } from 'next'
import './globals.css'
import HeaderActions from '@/components/HeaderActions'

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
      <body>
        <header className="app-header">
          <div className="app-header-inner">
            <div>
              <h1 className="text-lg font-heading text-ft-dark">V3ktor Operational Dashboard</h1>
              <p className="text-sm text-gray-500">Radical transparency into V3ktor's operations</p>
            </div>

            <div className="flex items-center gap-4">
              <HeaderActions />
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  )
}
