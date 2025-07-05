'use client'

import { signIn } from 'next-auth/react'
import { Calendar, Shield, Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'

interface LoginFormProps {
  isLoading: boolean
}

export default function LoginForm({ isLoading }: LoginFormProps) {
  const { theme, isDark, setTheme } = useTheme()

  const handleGoogleLogin = () => {
    signIn('google')
  }

  const themeClass = isDark ? 'dark' : ''

  return (
    <div className={`${themeClass} min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-200`}>
      <div className='min-h-screen flex items-center justify-center p-4'>
        <div className='max-w-md w-full'>
          {/* テーマ切り替え */}
          <div className='flex justify-end mb-8'>
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
          </div>

          {/* ログインカード */}
          <div className='bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8 backdrop-blur-sm'>
            {/* ロゴとタイトル */}
            <div className='text-center mb-8'>
              <div className='p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg inline-block mb-4'>
                <Calendar className='w-12 h-12 text-white' />
              </div>
              <h1 className='text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2'>
                Clip My Schedule
              </h1>
              <p className='text-gray-600 dark:text-gray-400'>
                簡単スケジュール調整
              </p>
            </div>

            {/* プライバシー情報 */}
            <div className='bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 mb-6 border border-blue-200 dark:border-blue-800'>
              <div className='flex items-center gap-3 mb-2'>
                <Shield className='w-5 h-5 text-blue-600 dark:text-blue-400' />
                <span className='font-semibold text-blue-900 dark:text-blue-100'>
                  プライバシーについて
                </span>
              </div>
              <p className='text-sm text-blue-800 dark:text-blue-200'>
                お客様のカレンダー情報は暗号化され、安全に処理されます。
                データは一時的に処理されるのみで、永続的な保存は行いません。
              </p>
            </div>

            {/* ログインボタン */}
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className='w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {isLoading ? (
                <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white'></div>
              ) : (
                <>
                  <svg className='w-5 h-5' viewBox='0 0 24 24'>
                    <path
                      fill='currentColor'
                      d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
                    />
                    <path
                      fill='currentColor'
                      d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
                    />
                    <path
                      fill='currentColor'
                      d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
                    />
                    <path
                      fill='currentColor'
                      d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
                    />
                  </svg>
                  Google でログイン
                </>
              )}
            </button>

            {/* フッター */}
            <div className='mt-6 text-center space-y-2'>
              <p className='text-xs text-gray-500 dark:text-gray-400'>
                ログインすることで、
                <a
                  href='/terms'
                  className='text-blue-600 dark:text-blue-400 hover:underline'
                >
                  利用規約
                </a>
                および
                <a
                  href='/privacy'
                  className='text-blue-600 dark:text-blue-400 hover:underline'
                >
                  プライバシーポリシー
                </a>
                に同意したことになります。
              </p>
              <p className='text-xs text-gray-500 dark:text-gray-400'>
                © 2025{' '}
                <a
                  href='https://studio-spoon.co.jp/'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-blue-600 dark:text-blue-400 hover:underline'
                >
                  STUDIO SPOON
                </a>
                . All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}