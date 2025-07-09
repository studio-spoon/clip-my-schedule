'use client';

import { Calendar, LogOut } from 'lucide-react';
import { useSession } from 'next-auth/react';

// ...

interface AppHeaderProps {
  session: ReturnType<typeof useSession>['data'];
  onLogout: () => void;
}

export default function AppHeader({ session, onLogout }: AppHeaderProps) {

  return (
    <div className='mb-4 md:mb-6 lg:mb-8'>
      {/* デスクトップレイアウト */}
      <div className='hidden md:flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <div className='p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg'>
            <Calendar className='w-8 h-8 text-white' />
          </div>
          <div>
            <h1 className='text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent'>
              Time Clipper
            </h1>
            <p className='text-gray-600 dark:text-gray-400 text-sm'>
              Googleカレンダーの空き時間を簡単リストアップ
            </p>
          </div>
        </div>
        
        <div className='flex items-center gap-4'>
          {/* ユーザー情報 */}
          <a
            href='/mypage'
            className='flex items-center gap-3 bg-white dark:bg-gray-800 rounded-full px-4 py-2 shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'
          >
            {session?.user?.image ? (
              <img
                src={session.user.image}
                alt={session.user.name || 'User'}
                className='w-8 h-8 rounded-full object-cover'
                loading="eager"
                referrerPolicy="no-referrer"
                crossOrigin="anonymous"
                onLoad={(e) => {
                  const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                  if (fallback) {
                    fallback.style.display = 'none';
                  }
                }}
                onError={(e) => {
                  console.log('Profile image failed to load, falling back to initials');
                  e.currentTarget.style.display = 'none';
                  const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                  if (fallback) {
                    fallback.style.display = 'flex';
                  }
                }}
              />
            ) : null}
            <div 
              className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm"
              style={{ display: session?.user?.image ? 'none' : 'flex' }}
            >
              {session?.user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className='hidden lg:block'>
              <p className='text-sm font-medium text-gray-900 dark:text-white'>
                {session?.user?.name}
              </p>
              <p className='text-xs text-gray-500 dark:text-gray-400'>
                {session?.user?.email}
              </p>
            </div>
          </a>

          {/* ログアウトボタン */}
          <button
            onClick={onLogout}
            className='p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-red-500 transition-colors'
            title='ログアウト'
          >
            <LogOut className='w-5 h-5' />
          </button>
        </div>
      </div>

      {/* モバイルレイアウト */}
      <div className='md:hidden'>
        {/* モバイルヘッダー行1: タイトルとユーザーアバター */}
        <div className='flex items-center justify-between mb-2 sm:mb-3'>
          <div className='flex items-center gap-2 sm:gap-3'>
            <div className='p-1.5 sm:p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg'>
              <Calendar className='w-5 h-5 sm:w-6 sm:h-6 text-white' />
            </div>
            <div>
              <h1 className='text-lg sm:text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent'>
                Time Clipper
              </h1>
            </div>
          </div>
          
          <div className='flex items-center gap-2'>
            {/* ユーザーアバターのみ */}
            <a href='/mypage' className='flex items-center'>
              {session?.user?.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name || 'User'}
                  className='w-8 h-8 rounded-full object-cover'
                  loading="eager"
                  referrerPolicy="no-referrer"
                  crossOrigin="anonymous"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                    if (fallback) {
                      fallback.style.display = 'flex';
                    }
                  }}
                />
              ) : null}
              <div 
                className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm"
                style={{ display: session?.user?.image ? 'none' : 'flex' }}
              >
                {session?.user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            </a>
            
            {/* ログアウトボタン */}
            <button
              onClick={onLogout}
              className='p-2 bg-white dark:bg-gray-800 rounded-full shadow border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-red-500 transition-colors'
              title='ログアウト'
            >
              <LogOut className='w-4 h-4' />
            </button>
          </div>
        </div>
        
        {/* モバイルヘッダー行2: サブタイトル */}
        <p className='text-gray-600 dark:text-gray-400 text-sm'>
          Googleカレンダーの空き時間を簡単リストアップ
        </p>
      </div>
    </div>
  );
}