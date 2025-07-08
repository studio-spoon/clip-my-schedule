'use client'

import React, { createContext, useContext, ReactNode } from 'react'
import { useTheme, Theme, ThemeMode } from '@/hooks/useTheme'

interface ThemeContextType {
  theme: Theme
  themeMode: ThemeMode
  setThemeMode: (mode: ThemeMode) => void
  toggleTheme: () => void
  applyTheme: (theme: Theme) => void
  systemTheme: Theme
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

interface ThemeProviderProps {
  children: ReactNode
  defaultMode?: ThemeMode
}

export function ThemeProvider({ children, defaultMode = 'system' }: ThemeProviderProps) {
  const themeUtils = useTheme(defaultMode)

  return (
    <ThemeContext.Provider value={themeUtils}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useThemeContext() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider')
  }
  return context
}

// Higher-order component to provide theme context to any component
export function withTheme<P extends object>(
  Component: React.ComponentType<P>,
  defaultMode?: ThemeMode
) {
  return function ThemedComponent(props: P) {
    return (
      <ThemeProvider defaultMode={defaultMode}>
        <Component {...props} />
      </ThemeProvider>
    )
  }
}