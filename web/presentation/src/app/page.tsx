import fs from 'fs'
import path from 'path'
import HomePageClient from '@/components/HomePageClient'

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif'])

export default function HomePage() {
  const dir = path.join(process.cwd(), 'public', 'images', 'hero-slideshow')
  let heroImages: string[] = []

  try {
    const files = fs.readdirSync(dir)
    heroImages = files
      .filter(f => IMAGE_EXTENSIONS.has(path.extname(f).toLowerCase()))
      .sort()
      .map(f => `/images/hero-slideshow/${f}`)
  } catch {
    heroImages = ['/images/generated/hero-landscape-enhanced.webp']
  }

  return <HomePageClient heroImages={heroImages} />
}
