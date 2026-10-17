import type { ThemeId } from '../types'

export interface ThemeDef {
  id: ThemeId
  name: string
  /** Hex used only for the swatch button in the UI. */
  swatch: string
  /** HSL triple for --primary in light mode. */
  light: { primary: string; foreground: string }
  /** HSL triple for --primary in dark mode. */
  dark: { primary: string; foreground: string }
}

export const THEMES: ThemeDef[] = [
  {
    id: 'purple',
    name: 'Purple',
    swatch: '#7c3aed',
    light: { primary: '262 83% 58%', foreground: '0 0% 100%' },
    dark: { primary: '263 70% 65%', foreground: '0 0% 100%' },
  },
  {
    id: 'indigo',
    name: 'Indigo',
    swatch: '#4f46e5',
    light: { primary: '239 84% 67%', foreground: '0 0% 100%' },
    dark: { primary: '234 89% 74%', foreground: '0 0% 100%' },
  },
  {
    id: 'blue',
    name: 'Blue',
    swatch: '#2563eb',
    light: { primary: '221 83% 53%', foreground: '0 0% 100%' },
    dark: { primary: '217 91% 60%', foreground: '0 0% 100%' },
  },
  {
    id: 'emerald',
    name: 'Emerald',
    swatch: '#059669',
    light: { primary: '158 84% 39%', foreground: '0 0% 100%' },
    dark: { primary: '158 64% 52%', foreground: '0 0% 100%' },
  },
  {
    id: 'rose',
    name: 'Rose',
    swatch: '#e11d48',
    light: { primary: '347 77% 50%', foreground: '0 0% 100%' },
    dark: { primary: '350 89% 60%', foreground: '0 0% 100%' },
  },
  {
    id: 'amber',
    name: 'Amber',
    swatch: '#d97706',
    light: { primary: '32 95% 44%', foreground: '0 0% 100%' },
    dark: { primary: '38 92% 55%', foreground: '0 0% 100%' },
  },
]

export const DEFAULT_THEME: ThemeId = 'purple'

export function getTheme(id: ThemeId): ThemeDef {
  return THEMES.find((t) => t.id === id) ?? THEMES[0]
}
