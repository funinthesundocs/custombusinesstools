import type { Metadata, Viewport } from 'next'
import { Playfair_Display, DM_Sans, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { NavBar } from '@/components/NavBar'
import { Footer } from '@/components/Footer'
import { AOSInit } from '@/components/AOSInit'
import { AIAssistantProvider } from '@/contexts/AIAssistantContext'
import { AIAssistantModal } from '@/components/AIAssistantModal'

const playfair = Playfair_Display({ subsets: ['latin'], weight: ['700'], variable: '--font-playfair' })
const dmSans = DM_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-dm-sans' })
const jetbrains = JetBrains_Mono({ subsets: ['latin'], weight: ['500', '700'], variable: '--font-jetbrains' })

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export const metadata: Metadata = {
  title: 'Genluiching Mining Corporation',
  description: 'A polymetallic deposit validated by nine independent laboratories across five countries. MPSA 251(A)-2007-XI, Davao Oriental, Philippines.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable} ${jetbrains.variable}`}>
      <body>
        <AIAssistantProvider>
          <AOSInit />
          <NavBar />
          <main>{children}</main>
          <Footer />
          <AIAssistantModal />
        </AIAssistantProvider>
      </body>
    </html>
  )
}
