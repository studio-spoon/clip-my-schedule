'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useUserSettings } from '@/hooks/useUserSettings'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextType {
  theme: Theme
  isDark: boolean
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('system')
  const [isDark, setIsDark] = useState(false)
  const { settings, updateSetting } = useUserSettings()

  // ユーザー設定からテーマを初期化
  useEffect(() => {
    if (settings.theme) {
      setTheme(settings.theme as Theme)
    }
  }, [settings.theme])

  // テーマに基づいてisDarkを更新
  useEffect(() => {
    const updateTheme = () => {
      let darkMode = false
      
      if (theme === 'system') {
        darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches
      } else {
        darkMode = theme === 'dark'
      }
      
      setIsDark(darkMode)
      
      // HTMLのdarkクラスを更新
      if (darkMode) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }

    updateTheme()

    // システムテーマの場合のみ、システム設定の変更を監視
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      mediaQuery.addEventListener('change', updateTheme)
      return () => mediaQuery.removeEventListener('change', updateTheme)
    }
  }, [theme])

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme)
    // ユーザー設定に保存
    updateSetting('theme', newTheme)
  }

  return (
    <ThemeContext.Provider 
      value={{ 
        theme, 
        isDark, 
        setTheme: handleThemeChange 
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}