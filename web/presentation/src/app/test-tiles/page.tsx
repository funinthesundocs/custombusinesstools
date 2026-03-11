'use client'

import './tiles.css'

const tiles = [
  { id: 1, effect: 'radial-burst', color: '#E63946', name: 'Radial Burst', desc: 'Circle expands from center' },
  { id: 2, effect: 'diagonal-wipe', color: '#457B9D', name: 'Diagonal Wipe', desc: 'Corner-to-corner sweep' },
  { id: 3, effect: 'curtain-split', color: '#2A9D8F', name: 'Curtain Split', desc: 'Opens from center outward' },
  { id: 4, effect: 'diamond-reveal', color: '#6A0572', name: 'Diamond Reveal', desc: 'Diamond shape expands' },
  { id: 5, effect: 'venetian-blinds', color: '#264653', name: 'Venetian Blinds', desc: 'Horizontal strips fill' },
  { id: 6, effect: 'flip-3d', color: '#E76F51', name: '3D Flip', desc: 'Card flips to reveal back' },
  { id: 7, effect: 'shutter-vertical', color: '#1D3557', name: 'Vertical Shutter', desc: 'Vertical strips close' },
  { id: 8, effect: 'liquid-fill', color: '#006D77', name: 'Liquid Fill', desc: 'Rises like water from bottom' },
  { id: 9, effect: 'spotlight', color: '#4A4E69', name: 'Spotlight', desc: 'Circular light follows hover' },
  { id: 10, effect: 'neon-glow', color: '#00F5D4', name: 'Neon Glow', desc: 'Pulsing neon border + fill' },
  { id: 11, effect: 'slide-up', color: '#7209B7', name: 'Slide Up', desc: 'Color rises from bottom edge' },
  { id: 12, effect: 'zoom-fade', color: '#F72585', name: 'Zoom Fade', desc: 'Scales in with fade' },
  { id: 13, effect: 'corner-fold', color: '#3A86FF', name: 'Corner Fold', desc: 'Peels from bottom-right' },
  { id: 14, effect: 'cross-fade', color: '#8338EC', name: 'Cross Fade', desc: 'X pattern expands from center' },
  { id: 15, effect: 'bounce-fill', color: '#FF6B35', name: 'Bounce Fill', desc: 'Elastic overshoot scale' },
  { id: 16, effect: 'rotate-in', color: '#004E64', name: 'Rotate In', desc: 'Spins and scales from 0' },
  { id: 17, effect: 'glitch', color: '#EF233C', name: 'Glitch', desc: 'RGB offset + noise' },
  { id: 18, effect: 'gradient-shift', color: '#B5179E', name: 'Gradient Shift', desc: 'Hue rotates through spectrum' },
  { id: 19, effect: 'inset-border', color: '#38B000', name: 'Inset Border', desc: 'Border grows inward to fill' },
  { id: 20, effect: 'particle-dissolve', color: '#FB8500', name: 'Particle Dissolve', desc: 'Dot pattern fills in' },
]

export default function TestTilesPage() {
  return (
    <div className="min-h-screen bg-zinc-950 p-8 pt-24">
      <h1 className="text-white text-3xl font-bold text-center mb-2">Hover Transition Lab</h1>
      <p className="text-zinc-400 text-center mb-10">20 tiles — 20 effects — hover each to preview</p>
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-5">
        {tiles.map((t) => (
          <div
            key={t.id}
            className={`tile tile--${t.effect}`}
            style={{ '--tile-color': t.color } as React.CSSProperties}
          >
            <div className="tile__content">
              <div className="tile__number">{String(t.id).padStart(2, '0')}</div>
              <div className="tile__name">{t.name}</div>
              <div className="tile__desc">{t.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
