import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Content Monitor',
  description: 'Monitor RSS feeds and blogs for new content',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-background">
          <header className="border-b">
            <div className="max-w-7xl mx-auto px-4 h-14 flex items-center">
              <a href="/" className="font-semibold text-sm tracking-tight">
                Content Monitor
              </a>
            </div>
          </header>
          <main className="max-w-7xl mx-auto px-4 py-8">
            {children}
          </main>
        </div>
        <Toaster />
      </body>
    </html>
  )
}
