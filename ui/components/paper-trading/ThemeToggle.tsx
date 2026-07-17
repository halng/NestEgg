"use client"

import { useEffect, useState } from "react"
import { Sun, Moon, Monitor } from "lucide-react"

type Theme = 'light' | 'dark' | 'system'

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('system')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem('theme') as Theme | null
    if (savedTheme) {
      setTheme(savedTheme)
      applyTheme(savedTheme)
    }
  }, [])

  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement
    
    if (newTheme === 'system') {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      root.classList.toggle('dark', systemDark)
    } else {
      root.classList.toggle('dark', newTheme === 'dark')
    }
  }

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    applyTheme(newTheme)
  }

  useEffect(() => {
    if (theme !== 'system') return
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => applyTheme('system')
    
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [theme])

  if (!mounted) {
    return <div className="h-9 w-[108px] rounded-lg bg-muted animate-pulse" />
  }

  return (
    <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
      <ThemeButton
        isActive={theme === 'light'}
        onClick={() => handleThemeChange('light')}
        icon={Sun}
        label="Light"
      />
      <ThemeButton
        isActive={theme === 'dark'}
        onClick={() => handleThemeChange('dark')}
        icon={Moon}
        label="Dark"
      />
      <ThemeButton
        isActive={theme === 'system'}
        onClick={() => handleThemeChange('system')}
        icon={Monitor}
        label="System"
      />
    </div>
  )
}

function ThemeButton({ 
  isActive, 
  onClick, 
  icon: Icon, 
  label 
}: { 
  isActive: boolean
  onClick: () => void
  icon: typeof Sun
  label: string
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center rounded-md p-2 transition ${
        isActive 
          ? 'bg-background text-foreground shadow-sm' 
          : 'text-muted-foreground hover:text-foreground'
      }`}
      title={label}
    >
      <Icon className="h-4 w-4" />
    </button>
  )
}

export function ThemeToggleCompact() {
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setIsDark(document.documentElement.classList.contains('dark'))
  }, [])

  const toggleTheme = () => {
    const newIsDark = !isDark
    setIsDark(newIsDark)
    document.documentElement.classList.toggle('dark', newIsDark)
    localStorage.setItem('theme', newIsDark ? 'dark' : 'light')
  }

  if (!mounted) return null

  return (
    <button
      onClick={toggleTheme}
      className="rounded-lg p-2 hover:bg-muted transition"
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  )
}
