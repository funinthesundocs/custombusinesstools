import { ChevronDown } from 'lucide-react'

interface SectionHeroProps {
  headline: string
  subheadline?: string
  imageSrc?: string
  height?: string
  showScroll?: boolean
}

export function SectionHero({ headline, subheadline, imageSrc, height = 'h-[70vh]', showScroll = false }: SectionHeroProps) {
  return (
    <section className={`relative ${height} flex items-center justify-center overflow-hidden`}>
      {imageSrc ? (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${imageSrc})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
        </div>
      ) : (
        <div className="absolute inset-0 gradient-fallback" />
      )}
      <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
        <h1 className="font-playfair font-bold text-4xl md:text-5xl lg:text-6xl text-white leading-tight projector-scale">
          {headline}
        </h1>
        {subheadline && (
          <p className="mt-6 text-lg md:text-xl text-white/80 font-sans max-w-2xl mx-auto">
            {subheadline}
          </p>
        )}
      </div>
      {showScroll && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="text-white/60" size={32} />
        </div>
      )}
    </section>
  )
}
