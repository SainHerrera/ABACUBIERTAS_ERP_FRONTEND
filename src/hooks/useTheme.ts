import { useCallback, useEffect, useState } from 'react'

export type ThemeMode = 'light' | 'dark'

const THEME_KEY = 'abacubiertas_theme'
const THEME_EVENT = 'abacubiertas-theme-change'

const readStoredTheme = (): ThemeMode =>
  localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light'

const currentMode = (): ThemeMode =>
  document.documentElement.classList.contains('ion-palette-dark') ? 'dark' : 'light'

export const applyTheme = (mode: ThemeMode): void => {
  document.documentElement.classList.toggle('ion-palette-dark', mode === 'dark')
  document.documentElement.style.colorScheme = mode
  try {
    localStorage.setItem(THEME_KEY, mode)
  } catch {
    // localStorage no disponible: ignorar persistencia
  }
  window.dispatchEvent(new CustomEvent(THEME_EVENT))
}

export const initTheme = (): void => {
  applyTheme(readStoredTheme())
}

export const useTheme = (): { theme: ThemeMode; toggleTheme: () => void } => {
  const [theme, setTheme] = useState<ThemeMode>(currentMode)

  useEffect(() => {
    const onThemeChange = () => setTheme(currentMode())
    window.addEventListener(THEME_EVENT, onThemeChange)
    return () => window.removeEventListener(THEME_EVENT, onThemeChange)
  }, [])

  const toggleTheme = useCallback(() => {
    applyTheme(theme === 'dark' ? 'light' : 'dark')
  }, [theme])

  return { theme, toggleTheme }
}