'use client'

import React, { ReactNode } from 'react'
import { ThemeProvider } from '@/contexts/ThemeProvider'
import { Theme, ThemeMode } from '@/hooks/useTheme'

interface ThemeAwareComponentProps {
  children: ReactNode
  defaultMode?: ThemeMode
  forceTheme?: Theme
  className?: string
}

/**
 * A wrapper component that provides theme context and applies theme styling
 * Can be used to force a specific theme or use a default theme
 */
export default function ThemeAwareComponent({
  children,
  defaultMode = 'system',
  forceTheme,
  className = ''
}: ThemeAwareComponentProps) {
  const effectiveMode = defaultMode
  const effectiveThemeClass = forceTheme ? `${forceTheme}-theme` : ''

  return (
    <ThemeProvider defaultMode={effectiveMode}>
      <div 
        className={`theme-aware-wrapper ${effectiveThemeClass} ${className}`}
        style={{
          backgroundColor: 'var(--background)',
          color: 'var(--foreground)'
        }}
      >
        {children}
      </div>
    </ThemeProvider>
  )
}

/**
 * Hook to create a theme-aware component with specific theme
 */
export function createThemeAwareComponent<P extends object>(
  Component: React.ComponentType<P>,
  theme: Theme
) {
  return function ThemedComponent(props: P) {
    return (
      <ThemeAwareComponent forceTheme={theme}>
        <Component {...props} />
      </ThemeAwareComponent>
    )
  }
}

// Pre-configured components for common use cases
export const LightThemeComponent = ({ children, ...props }: Omit<ThemeAwareComponentProps, 'forceTheme'>) => (
  <ThemeAwareComponent forceTheme="light" {...props}>
    {children}
  </ThemeAwareComponent>
)

export const DarkThemeComponent = ({ children, ...props }: Omit<ThemeAwareComponentProps, 'forceTheme'>) => (
  <ThemeAwareComponent forceTheme="dark" {...props}>
    {children}
  </ThemeAwareComponent>
)

export const SystemThemeComponent = ({ children, ...props }: Omit<ThemeAwareComponentProps, 'forceTheme' | 'defaultMode'>) => (
  <ThemeAwareComponent defaultMode="system" {...props}>
    {children}
  </ThemeAwareComponent>
)