'use client'

import { useState, useEffect, useCallback } from 'react'

export type Theme = 'light' | 'dark'
export type ThemeMode = 'light' | 'dark' | 'system'

interface UseThemeReturn {
  theme: Theme
  themeMode: ThemeMode
  setThemeMode: (mode: ThemeMode) => void
  toggleTheme: () => void
  applyTheme: (theme: Theme) => void
  systemTheme: Theme
}

const THEME_STORAGE_KEY = 'time-clipper-theme-mode'

export function useTheme(defaultMode: ThemeMode = 'system'): UseThemeReturn {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(defaultMode)
  const [systemTheme, setSystemTheme] = useState<Theme>('light')
  
  // Calculate the actual theme based on mode
  const theme = themeMode === 'system' ? systemTheme : themeMode

  // Detect system theme preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const updateSystemTheme = () => {
      setSystemTheme(mediaQuery.matches ? 'dark' : 'light')
    }
    
    // Set initial system theme
    updateSystemTheme()
    
    // Listen for system theme changes
    mediaQuery.addEventListener('change', updateSystemTheme)
    
    return () => mediaQuery.removeEventListener('change', updateSystemTheme)
  }, [])
  
  // Load theme mode from localStorage on mount
  useEffect(() => {
    const savedMode = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null
    if (savedMode && ['light', 'dark', 'system'].includes(savedMode)) {
      setThemeModeState(savedMode)
    } else {
      setThemeModeState(defaultMode)
    }
  }, [defaultMode])
  
  // Apply theme to document body
  const applyTheme = useCallback((newTheme: Theme) => {
    // Remove existing theme classes
    document.body.classList.remove('light-theme', 'dark-theme')
    
    // Add new theme class
    document.body.classList.add(`${newTheme}-theme`)
    
    // Update the CSS custom property fallback
    document.documentElement.style.setProperty('--current-theme', newTheme)
  }, [])

  // Apply theme when theme or themeMode changes
  useEffect(() => {
    applyTheme(theme)
  }, [theme, applyTheme])

  // Set theme mode and persist to localStorage
  const setThemeMode = useCallback((newMode: ThemeMode) => {
    setThemeModeState(newMode)
    localStorage.setItem(THEME_STORAGE_KEY, newMode)
  }, [])

  // Toggle between light and dark themes (skips system)
  const toggleTheme = useCallback(() => {
    const newMode = theme === 'light' ? 'dark' : 'light'
    setThemeMode(newMode)
  }, [theme, setThemeMode])

  return {
    theme,
    themeMode,
    setThemeMode,
    toggleTheme,
    applyTheme,
    systemTheme
  }
}