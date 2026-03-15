import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { Sidebar } from '@/components/Sidebar'
import { ColorInitializer } from '@/components/ColorInitializer'
import { SeedInitializer } from '@/components/SeedInitializer'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' })

export const metadata: Metadata = {
  title: 'RAG Factory Dashboard',
  description: 'RAG Factory',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-black text-zinc-100 font-[family-name:var(--font-inter)] antialiased">
        <ColorInitializer />
        <SeedInitializer />
        <div className="flex h-screen">
          <Sidebar />
          <main className="flex-1 overflow-auto p-6 lg:p-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
