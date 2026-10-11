import { create } from 'zustand'

type Theme = 'light' | 'dark' | 'system'

interface ThemeState {
  theme: Theme
  color: string
  setTheme: (theme: Theme) => void
  setColor: (color: string) => void
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: 'system',
  color: '#4f46e5',
  setTheme: (theme) => {
    set({ theme })
    localStorage.setItem('theme', theme)
    applyTheme(theme)
  },
  setColor: (color) => {
    set({ color })
    localStorage.setItem('primary-color', color)
    applyColor(color)
  },
}))

function applyTheme(theme: Theme) {
  const root = document.documentElement
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  root.classList.toggle('dark', isDark)
}

function hexToHslTriple(hex: string): string {
  let value = hex.replace('#', '')
  if (value.length === 3) {
    value = value
      .split('')
      .map((c) => c + c)
      .join('')
  }
  const r = parseInt(value.slice(0, 2), 16) / 255
  const g = parseInt(value.slice(2, 4), 16) / 255
  const b = parseInt(value.slice(4, 6), 16) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const light = (max + min) / 2
  const delta = max - min
  let hue = 0
  let sat = 0
  if (delta !== 0) {
    sat = light > 0.5 ? delta / (2 - max - min) : delta / (max + min)
    switch (max) {
      case r:
        hue = (g - b) / delta + (g < b ? 6 : 0)
        break
      case g:
        hue = (b - r) / delta + 2
        break
      default:
        hue = (r - g) / delta + 4
    }
    hue *= 60
  }
  return `${Math.round(hue)} ${Math.round(sat * 100)}% ${Math.round(light * 100)}%`
}

function readableForeground(hex: string): string {
  let value = hex.replace('#', '')
  if (value.length === 3) {
    value = value
      .split('')
      .map((c) => c + c)
      .join('')
  }
  const r = parseInt(value.slice(0, 2), 16)
  const g = parseInt(value.slice(2, 4), 16)
  const b = parseInt(value.slice(4, 6), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.6 ? '222.2 47.4% 11.2%' : '0 0% 98%'
}

function applyColor(color: string) {
  const root = document.documentElement
  root.style.setProperty('--primary', hexToHslTriple(color))
  root.style.setProperty('--primary-foreground', readableForeground(color))
}

export function initializeTheme() {
  const theme = (localStorage.getItem('theme') as Theme) || 'system'
  const color = localStorage.getItem('primary-color') || '#4f46e5'
  useThemeStore.setState({ theme, color })
  applyTheme(theme)
  applyColor(color)
}