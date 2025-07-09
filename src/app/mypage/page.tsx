'use client';

import { useSession } from 'next-auth/react';
import MyPage from '@/components/MyPage';
import LoginForm from '@/components/LoginForm';
import Footer from '@/components/Footer';
import { ThemeProvider } from '@/contexts/ThemeProvider';

export default function MyPagePage() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800'>
        <div className='container mx-auto px-4 py-16'>
          <div className='max-w-md mx-auto'>
            <div className='text-center mb-8'>
              <h1 className='text-2xl font-bold text-gray-900 dark:text-white mb-2'>
                マイページ
              </h1>
              <p className='text-gray-600 dark:text-gray-400'>
                設定を管理するにはログインが必要です
              </p>
            </div>
            <LoginForm isLoading={false} />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <ThemeProvider>
      <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800'>
        <div className='container mx-auto px-2 sm:px-4 py-8'>
          <MyPage />
        </div>
        <Footer />
      </div>
    </ThemeProvider>
  );
}
