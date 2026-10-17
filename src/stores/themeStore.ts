import { create } from 'zustand'
import type { ThemeId, ThemeMode } from '../types'
import { DEFAULT_THEME, getTheme } from '../config/themes'

interface ThemeState {
  mode: ThemeMode
  accent: ThemeId
  setMode: (mode: ThemeMode) => void
  setAccent: (accent: ThemeId) => void
}

const MODE_KEY = 'skledger_mode'
const ACCENT_KEY = 'skledger_accent'

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: 'system',
  accent: DEFAULT_THEME,
  setMode: (mode) => {
    set({ mode })
    localStorage.setItem(MODE_KEY, mode)
    applyTheme(mode)
    applyAccent(get().accent)
  },
  setAccent: (accent) => {
    set({ accent })
    localStorage.setItem(ACCENT_KEY, accent)
    applyAccent(accent)
  },
}))

function isDark(mode: ThemeMode): boolean {
  return (
    mode === 'dark' ||
    (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  )
}

function applyTheme(mode: ThemeMode) {
  document.documentElement.classList.toggle('dark', isDark(mode))
}

function applyAccent(accent: ThemeId) {
  const def = getTheme(accent)
  const palette = document.documentElement.classList.contains('dark') ? def.dark : def.light
  const root = document.documentElement
  root.style.setProperty('--primary', palette.primary)
  root.style.setProperty('--primary-foreground', palette.foreground)
  root.style.setProperty('--ring', palette.primary)
}

export function initializeTheme() {
  const mode = (localStorage.getItem(MODE_KEY) as ThemeMode) || 'system'
  const accent = (localStorage.getItem(ACCENT_KEY) as ThemeId) || DEFAULT_THEME
  useThemeStore.setState({ mode, accent })
  applyTheme(mode)
  applyAccent(accent)

  window
    .matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', () => {
      if (useThemeStore.getState().mode === 'system') {
        applyTheme('system')
        applyAccent(useThemeStore.getState().accent)
      }
    })
}

export function applyThemePreference(mode: ThemeMode, accent: ThemeId) {
  useThemeStore.setState({ mode, accent })
  localStorage.setItem(MODE_KEY, mode)
  localStorage.setItem(ACCENT_KEY, accent)
  applyTheme(mode)
  applyAccent(accent)
}
