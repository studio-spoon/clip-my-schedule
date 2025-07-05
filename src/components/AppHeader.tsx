'use client'

import { Calendar, LogOut, Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import type { Session } from 'next-auth'

interface AppHeaderProps {
  session: Session | null
  onLogout: () => void
}

export default function AppHeader({ session, onLogout }: AppHeaderProps) {
  const { theme, setTheme } = useTheme()

  return (
    <div className='mb-8 flex items-center justify-between'>
      <div className='flex items-center gap-4'>
        <div className='p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg'>
          <Calendar className='w-8 h-8 text-white' />
        </div>
        <div>
          <h1 className='text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent'>
            Clip My Schedule
          </h1>
          <p className='text-gray-600 dark:text-gray-400 text-sm'>
            簡単スケジュール調整
          </p>
        </div>
      </div>

      <div className='flex items-center gap-4'>
        {/* ユーザー情報 */}
        <div className='flex items-center gap-3 bg-white dark:bg-gray-800 rounded-full px-4 py-2 shadow-lg border border-gray-200 dark:border-gray-700'>
          <img
            src={session?.user?.image || 'https://via.placeholder.com/32x32/4F46E5/FFFFFF?text=U'}
            alt={session?.user?.name || 'User'}
            className='w-8 h-8 rounded-full'
          />
          <div className='hidden sm:block'>
            <p className='text-sm font-medium text-gray-900 dark:text-white'>
              {session?.user?.name}
            </p>
            <p className='text-xs text-gray-500 dark:text-gray-400'>
              {session?.user?.email}
            </p>
          </div>
        </div>

        {/* テーマ切り替え */}
        <div className='flex items-center gap-2 bg-white dark:bg-gray-800 rounded-full p-1 shadow-lg border border-gray-200 dark:border-gray-700'>
          <button
            onClick={() => setTheme('light')}
            className={`p-2 rounded-full transition-all duration-200 ${
              theme === 'light'
                ? 'bg-yellow-500 text-white shadow-md'
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
          >
            <Sun className='w-4 h-4' />
          </button>
          <button
            onClick={() => setTheme('system')}
            className={`p-2 rounded-full transition-all duration-200 ${
              theme === 'system'
                ? 'bg-gray-500 text-white shadow-md'
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
          >
            <Monitor className='w-4 h-4' />
          </button>
          <button
            onClick={() => setTheme('dark')}
            className={`p-2 rounded-full transition-all duration-200 ${
              theme === 'dark'
                ? 'bg-purple-500 text-white shadow-md'
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
          >
            <Moon className='w-4 h-4' />
          </button>
        </div>

        {/* ログアウトボタン */}
        <button
          onClick={onLogout}
          className='p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-red-500 transition-colors'
        >
          <LogOut className='w-5 h-5' />
        </button>
      </div>
    </div>
  )
}