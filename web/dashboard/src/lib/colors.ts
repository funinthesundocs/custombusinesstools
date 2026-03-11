export const COLOR_OPTIONS = [
  { name: 'Cyan', value: '#22D3EE', class: 'bg-cyan-400' },
  { name: 'Blue', value: '#3B82F6', class: 'bg-blue-500' },
  { name: 'Violet', value: '#8B5CF6', class: 'bg-violet-500' },
  { name: 'Emerald', value: '#34D399', class: 'bg-emerald-400' },
  { name: 'Amber', value: '#FBBF24', class: 'bg-amber-400' },
  { name: 'Rose', value: '#FB7185', class: 'bg-rose-400' },
  { name: 'Sky', value: '#38BDF8', class: 'bg-sky-400' },
  { name: 'Lime', value: '#A3E635', class: 'bg-lime-400' },
  { name: 'Orange', value: '#FB923C', class: 'bg-orange-400' },
  { name: 'Fuchsia', value: '#E879F9', class: 'bg-fuchsia-400' },
] as const

export type ColorOption = typeof COLOR_OPTIONS[number]

export function getStoredColor(): string {
  if (typeof window === 'undefined') return '#22D3EE'
  return localStorage.getItem('kop-primary-color') || '#22D3EE'
}

export function setStoredColor(color: string) {
  localStorage.setItem('kop-primary-color', color)
  document.documentElement.style.setProperty('--color-primary', color)
  // Set muted version (30% opacity)
  document.documentElement.style.setProperty('--color-primary-muted', color + '4D')
  // Set border version (50% opacity)
  document.documentElement.style.setProperty('--color-primary-border', color + '80')
}
