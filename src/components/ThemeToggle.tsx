'use client'

import React from 'react'
import { Sun, Moon } from 'lucide-react'
import { useThemeContext } from '@/contexts/ThemeProvider'

interface ThemeToggleProps {
  className?: string
  size?: number
}

export default function ThemeToggle({ className = '', size = 20 }: ThemeToggleProps) {
  const { theme, themeMode, toggleTheme } = useThemeContext()

  const getIcon = () => {
    if (themeMode === 'system') {
      return theme === 'light' ? <Moon size={size} /> : <Sun size={size} />
    }
    return theme === 'light' ? <Moon size={size} /> : <Sun size={size} />
  }

  const getLabel = () => {
    if (themeMode === 'system') {
      return `Currently ${theme} (system), click to toggle`
    }
    return `Switch to ${theme === 'light' ? 'dark' : 'light'} theme`
  }

  return (
    <button
      onClick={toggleTheme}
      className={`inline-flex items-center justify-center rounded-lg p-2 transition-colors hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 ${className}`}
      style={{
        backgroundColor: 'var(--secondary)',
        color: 'var(--secondary-foreground)',
        border: '1px solid var(--border)'
      }}
      title={getLabel()}
      aria-label={getLabel()}
    >
      {getIcon()}
    </button>
  )
}