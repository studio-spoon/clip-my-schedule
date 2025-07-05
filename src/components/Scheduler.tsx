'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Users,
  Copy,
  Check,
  Sun,
  Moon,
  Monitor,
  Settings,
  LogOut,
  Shield,
} from 'lucide-react';

const Scheduler = () => {
  // 認証状態
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{
    id: string;
    name: string;
    email: string;
    picture: string;
    domain: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // アプリケーション状態
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('直近2週間');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('デフォルト');
  const [customTimeStart, setCustomTimeStart] = useState('10:00');
  const [customTimeEnd, setCustomTimeEnd] = useState('17:00');
  const [meetingDuration, setMeetingDuration] = useState('60分');
  const [bufferTime, setBufferTime] = useState('30分');
  const [availableSlots, setAvailableSlots] = useState<{date: string, times: string[]}[]>([]);
  const [isCopied, setIsCopied] = useState(false);
  const [customDuration, setCustomDuration] = useState('75');
  const [theme, setTheme] = useState('system');
  const [isDark, setIsDark] = useState(false);

  // 初期化時にログイン状態をチェック
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // 実際の実装では、ここでGoogle OAuth SDKを初期化
        // 既存のセッションがあるかチェック
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          setUser(userData);
          setIsAuthenticated(true);
          setSelectedMembers([`${userData.name} (${userData.email})`]);
        }
      } catch (error) {
        console.error('認証初期化エラー:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // テーマ設定の初期化とシステム設定の監視
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'system';
    setTheme(savedTheme);

    const updateTheme = () => {
      if (savedTheme === 'system') {
        const systemDark = window.matchMedia(
          '(prefers-color-scheme: dark)'
        ).matches;
        setIsDark(systemDark);
      } else {
        setIsDark(savedTheme === 'dark');
      }
    };

    updateTheme();

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', updateTheme);

    return () => mediaQuery.removeEventListener('change', updateTheme);
  }, [theme]);

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);

    if (newTheme === 'system') {
      const systemDark = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches;
      setIsDark(systemDark);
    } else {
      setIsDark(newTheme === 'dark');
    }
  };

  // Google OAuth ログイン（実際の実装では Google OAuth SDK を使用）
  const handleGoogleLogin = async () => {
    try {
      // デモ用のログインシミュレーション
      // 実際の実装では：
      // const response = await gapi.auth2.getAuthInstance().signIn();
      // const profile = response.getBasicProfile();

      setIsLoading(true);

      // デモ用のユーザーデータ
      const demoUser = {
        id: 'demo123',
        name: '中村明史',
        email: 'nakamura@studio-spoon.co.jp',
        picture: 'https://via.placeholder.com/40x40/4F46E5/FFFFFF?text=N',
        domain: 'studio-spoon.co.jp',
      };

      // studio-spoon.co.jp ドメインのチェック
      if (!demoUser.email.endsWith('@studio-spoon.co.jp')) {
        alert('Studio Spoon のメールアドレスでログインしてください。');
        return;
      }

      // ログイン成功
      setUser(demoUser);
      setIsAuthenticated(true);
      setSelectedMembers([`${demoUser.name} (${demoUser.email})`]);
      localStorage.setItem('user', JSON.stringify(demoUser));
    } catch (error) {
      console.error('ログインエラー:', error);
      alert('ログインに失敗しました。もう一度お試しください。');
    } finally {
      setIsLoading(false);
    }
  };

  // ログアウト
  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setSelectedMembers([]);
    setAvailableSlots([]);
    localStorage.removeItem('user');
    // 実際の実装では：
    // gapi.auth2.getAuthInstance().signOut();
  };

  // サンプルチームメンバー（実際の実装では Google Directory API から取得）
  const teamMembers = [
    '田中太郎 (taro@studio-spoon.co.jp)',
    '佐藤花子 (hanako@studio-spoon.co.jp)',
    '山田次郎 (jiro@studio-spoon.co.jp)',
    '鈴木美咲 (misaki@studio-spoon.co.jp)',
    '高橋健一 (kenichi@studio-spoon.co.jp)',
  ];

  // サンプル空き時間データ
  const sampleAvailableSlots = [
    {
      date: '2025/7/7 (月)',
      times: ['10:00-11:00', '14:00-15:00', '16:00-17:00'],
    },
    {
      date: '2025/7/8 (火)',
      times: ['9:00-10:00', '11:00-12:00', '15:00-16:00'],
    },
    { date: '2025/7/9 (水)', times: ['10:00-11:00', '13:00-14:00'] },
    {
      date: '2025/7/10 (木)',
      times: ['9:00-10:00', '14:00-15:00', '16:00-17:00'],
    },
    { date: '2025/7/11 (金)', times: ['10:00-11:00', '15:00-16:00'] },
  ];

  const handleMemberToggle = (member: string) => {
    setSelectedMembers((prev) =>
      prev.includes(member)
        ? prev.filter((m) => m !== member)
        : [...prev, member]
    );
  };

  const handleSearch = () => {
    if (selectedMembers.length === 0) {
      alert('参加者を選択してください。');
      return;
    }
    setAvailableSlots(sampleAvailableSlots);
  };

  const generateTextOutput = () => {
    const memberList = selectedMembers.join(', ');
    const timeRange =
      selectedTimeSlot === 'デフォルト'
        ? '10:00-17:00'
        : `${customTimeStart}-${customTimeEnd}`;

    let output = `【スケジュール調整】\n\n`;
    output += `対象メンバー: ${memberList}\n`;
    output += `期間: ${selectedPeriod}\n`;
    output += `時間帯: ${timeRange}\n`;
    output += `所要時間: ${meetingDuration}\n`;
    output += `前後隙間時間: ${bufferTime}\n\n`;
    output += `【空き時間】\n`;

    availableSlots.forEach((slot) => {
      output += `${slot.date}\n`;
      slot.times.forEach((time) => {
        output += `  ・${time}\n`;
      });
      output += '\n';
    });

    return output;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generateTextOutput());
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('クリップボードへのコピーに失敗しました:', err);
    }
  };

  const themeClass = isDark ? 'dark' : '';

  // ローディング画面
  if (isLoading) {
    return (
      <div
        className={`${themeClass} min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center`}
      >
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
          <p className='text-gray-600 dark:text-gray-400'>読み込み中...</p>
        </div>
      </div>
    );
  }

  // ログイン画面
  if (!isAuthenticated) {
    return (
      <div
        className={`${themeClass} min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-200`}
      >
        <div className='min-h-screen flex items-center justify-center p-4'>
          <div className='max-w-md w-full'>
            {/* テーマ切り替え */}
            <div className='flex justify-end mb-8'>
              <div className='flex items-center gap-2 bg-white dark:bg-gray-800 rounded-full p-1 shadow-lg border border-gray-200 dark:border-gray-700'>
                <button
                  onClick={() => handleThemeChange('light')}
                  className={`p-2 rounded-full transition-all duration-200 ${
                    theme === 'light'
                      ? 'bg-yellow-500 text-white shadow-md'
                      : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                  }`}
                >
                  <Sun className='w-4 h-4' />
                </button>
                <button
                  onClick={() => handleThemeChange('system')}
                  className={`p-2 rounded-full transition-all duration-200 ${
                    theme === 'system'
                      ? 'bg-gray-500 text-white shadow-md'
                      : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                  }`}
                >
                  <Monitor className='w-4 h-4' />
                </button>
                <button
                  onClick={() => handleThemeChange('dark')}
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
                  Studio Spoon
                </h1>
                <p className='text-gray-600 dark:text-gray-400'>
                  スケジュール調整アプリ
                </p>
              </div>

              {/* セキュリティ情報 */}
              <div className='bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 mb-6 border border-blue-200 dark:border-blue-800'>
                <div className='flex items-center gap-3 mb-2'>
                  <Shield className='w-5 h-5 text-blue-600 dark:text-blue-400' />
                  <span className='font-semibold text-blue-900 dark:text-blue-100'>
                    セキュリティについて
                  </span>
                </div>
                <p className='text-sm text-blue-800 dark:text-blue-200'>
                  Studio Spoon
                  のメールアドレス（@studio-spoon.co.jp）でのログインが必要です。
                  お客様のカレンダー情報は暗号化され、安全に処理されます。
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
              <div className='mt-6 text-center'>
                <p className='text-xs text-gray-500 dark:text-gray-400'>
                  ログインすることで、
                  <a
                    href='#'
                    className='text-blue-600 dark:text-blue-400 hover:underline'
                  >
                    利用規約
                  </a>
                  および
                  <a
                    href='#'
                    className='text-blue-600 dark:text-blue-400 hover:underline'
                  >
                    プライバシーポリシー
                  </a>
                  に同意したことになります。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // メインアプリケーション（ログイン後）
  return (
    <div
      className={`${themeClass} min-h-screen transition-colors duration-200`}
    >
      <div className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-200'>
        <div className='p-4 lg:p-8'>
          <div className='max-w-6xl mx-auto'>
            {/* ヘッダー */}
            <div className='mb-8 flex items-center justify-between'>
              <div className='flex items-center gap-4'>
                <div className='p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg'>
                  <Calendar className='w-8 h-8 text-white' />
                </div>
                <div>
                  <h1 className='text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent'>
                    Studio Spoon
                  </h1>
                  <p className='text-gray-600 dark:text-gray-400 text-sm'>
                    スケジュール調整アプリ
                  </p>
                </div>
              </div>

              <div className='flex items-center gap-4'>
                {/* ユーザー情報 */}
                <div className='flex items-center gap-3 bg-white dark:bg-gray-800 rounded-full px-4 py-2 shadow-lg border border-gray-200 dark:border-gray-700'>
                  <img
                    src={user?.picture}
                    alt={user?.name}
                    className='w-8 h-8 rounded-full'
                  />
                  <div className='hidden sm:block'>
                    <p className='text-sm font-medium text-gray-900 dark:text-white'>
                      {user?.name}
                    </p>
                    <p className='text-xs text-gray-500 dark:text-gray-400'>
                      {user?.email}
                    </p>
                  </div>
                </div>

                {/* テーマ切り替え */}
                <div className='flex items-center gap-2 bg-white dark:bg-gray-800 rounded-full p-1 shadow-lg border border-gray-200 dark:border-gray-700'>
                  <button
                    onClick={() => handleThemeChange('light')}
                    className={`p-2 rounded-full transition-all duration-200 ${
                      theme === 'light'
                        ? 'bg-yellow-500 text-white shadow-md'
                        : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                    }`}
                  >
                    <Sun className='w-4 h-4' />
                  </button>
                  <button
                    onClick={() => handleThemeChange('system')}
                    className={`p-2 rounded-full transition-all duration-200 ${
                      theme === 'system'
                        ? 'bg-gray-500 text-white shadow-md'
                        : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                    }`}
                  >
                    <Monitor className='w-4 h-4' />
                  </button>
                  <button
                    onClick={() => handleThemeChange('dark')}
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
                  onClick={handleLogout}
                  className='p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-red-500 transition-colors'
                >
                  <LogOut className='w-5 h-5' />
                </button>
              </div>
            </div>

            {/* メインコンテンツ */}
            <div className='bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8 backdrop-blur-sm'>
              {/* 参加者選択 */}
              <div className='mb-8'>
                <div className='flex items-center gap-3 mb-4'>
                  <div className='p-2 bg-blue-100 dark:bg-blue-900 rounded-lg'>
                    <Users className='w-5 h-5 text-blue-600 dark:text-blue-400' />
                  </div>
                  <h2 className='text-lg font-semibold text-gray-900 dark:text-white'>
                    参加者を選択
                  </h2>
                  <span className='text-sm text-gray-500 dark:text-gray-400'>
                    共有済みカレンダーから
                  </span>
                </div>
                <div className='bg-gray-50 dark:bg-gray-700 rounded-xl p-4 border border-gray-200 dark:border-gray-600'>
                  <div className='space-y-3'>
                    {/* 自分（常に選択済み） */}
                    <label className='flex items-center gap-3 cursor-pointer group'>
                      <input
                        type='checkbox'
                        checked={selectedMembers.includes(
                          `${user?.name} (${user?.email})`
                        )}
                        onChange={() =>
                          handleMemberToggle(`${user?.name} (${user?.email})`)
                        }
                        className='w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600'
                      />
                      <span className='text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors font-medium'>
                        {user?.name} (あなた)
                      </span>
                    </label>

                    {/* チームメンバー */}
                    {teamMembers.map((member) => (
                      <label
                        key={member}
                        className='flex items-center gap-3 cursor-pointer group'
                      >
                        <input
                          type='checkbox'
                          checked={selectedMembers.includes(member)}
                          onChange={() => handleMemberToggle(member)}
                          className='w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600'
                        />
                        <span className='text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors'>
                          {member}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* 開催時期 */}
              <div className='mb-8'>
                <div className='flex items-center gap-3 mb-4'>
                  <div className='w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full shadow-sm'></div>
                  <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
                    開催時期
                  </h3>
                </div>
                <div className='flex flex-wrap gap-3'>
                  {['直近1週間', '直近2週間', '期間を指定'].map((period) => (
                    <button
                      key={period}
                      onClick={() => setSelectedPeriod(period)}
                      className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                        selectedPeriod === period
                          ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg transform scale-105'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:shadow-md'
                      }`}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>

              {/* 時間帯 */}
              <div className='mb-8'>
                <div className='flex items-center gap-3 mb-4'>
                  <div className='w-3 h-3 bg-gradient-to-r from-green-400 to-blue-500 rounded-full shadow-sm'></div>
                  <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
                    時間帯
                  </h3>
                  <span className='text-sm text-gray-500 dark:text-gray-400'>
                    <Settings className='w-4 h-4 inline mr-1' />
                    マイページでデフォルトの時間帯を設定
                  </span>
                </div>
                <div className='flex flex-wrap gap-3 mb-4'>
                  <button
                    onClick={() => setSelectedTimeSlot('デフォルト')}
                    className={`px-6 py-4 rounded-xl font-medium transition-all duration-200 ${
                      selectedTimeSlot === 'デフォルト'
                        ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:shadow-md'
                    }`}
                  >
                    <div className='text-center'>
                      <div>デフォルト</div>
                      <div className='text-sm opacity-90'>10:00-17:00</div>
                    </div>
                  </button>
                  <button
                    onClick={() => setSelectedTimeSlot('時間指定')}
                    className={`px-6 py-4 rounded-xl font-medium transition-all duration-200 ${
                      selectedTimeSlot === '時間指定'
                        ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:shadow-md'
                    }`}
                  >
                    時間指定
                  </button>
                </div>

                {selectedTimeSlot === '時間指定' && (
                  <div className='flex gap-4 items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600'>
                    <input
                      type='time'
                      value={customTimeStart}
                      onChange={(e) => setCustomTimeStart(e.target.value)}
                      className='border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    />
                    <span className='text-gray-500 dark:text-gray-400 font-medium'>
                      〜
                    </span>
                    <input
                      type='time'
                      value={customTimeEnd}
                      onChange={(e) => setCustomTimeEnd(e.target.value)}
                      className='border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    />
                  </div>
                )}
              </div>

              {/* 所要時間 */}
              <div className='mb-8'>
                <div className='flex items-center gap-3 mb-4'>
                  <div className='w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full shadow-sm'></div>
                  <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
                    所要時間
                  </h3>
                </div>
                <div className='flex flex-wrap gap-3 items-center'>
                  {['15分', '30分', '45分', '60分'].map((duration) => (
                    <button
                      key={duration}
                      onClick={() => setMeetingDuration(duration)}
                      className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                        meetingDuration === duration
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg transform scale-105'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:shadow-md'
                      }`}
                    >
                      {duration}
                    </button>
                  ))}
                  <div className='flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600'>
                    <span className='text-sm text-gray-600 dark:text-gray-400'>
                      時間指定
                    </span>
                    <input
                      type='number'
                      value={customDuration}
                      onChange={(e) => setCustomDuration(e.target.value)}
                      className='w-16 border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                    />
                    <span className='text-sm text-gray-600 dark:text-gray-400'>
                      分
                    </span>
                  </div>
                </div>
              </div>

              {/* 前後隙間時間 */}
              <div className='mb-8'>
                <div className='flex items-center gap-3 mb-4'>
                  <div className='w-3 h-3 bg-gradient-to-r from-red-400 to-pink-500 rounded-full shadow-sm'></div>
                  <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
                    前後隙間時間
                  </h3>
                </div>
                <div className='flex flex-wrap gap-3'>
                  {['0分', '15分', '30分', '45分', '60分'].map((buffer) => (
                    <button
                      key={buffer}
                      onClick={() => setBufferTime(buffer)}
                      className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                        bufferTime === buffer
                          ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg transform scale-105'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:shadow-md'
                      }`}
                    >
                      {buffer}
                    </button>
                  ))}
                </div>
              </div>

              {/* 検索ボタン */}
              <div className='mb-8'>
                <button
                  onClick={handleSearch}
                  className='w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-3'
                >
                  <Clock className='w-5 h-5' />
                  空き時間を検索
                </button>
              </div>

              {/* 結果表示 */}
              {availableSlots.length > 0 && (
                <div className='border-t border-gray-200 dark:border-gray-700 pt-8'>
                  <h3 className='text-2xl font-bold text-gray-900 dark:text-white mb-6'>
                    検索結果
                  </h3>

                  {/* 空き時間リスト */}
                  <div className='bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-2xl p-6 mb-6 border border-gray-200 dark:border-gray-600'>
                    <h4 className='text-lg font-semibold text-gray-800 dark:text-white mb-4'>
                      空き時間一覧
                    </h4>
                    <div className='space-y-4'>
                      {availableSlots.map((slot, index) => (
                        <div
                          key={index}
                          className='bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700'
                        >
                          <div className='font-semibold text-gray-900 dark:text-white mb-3'>
                            {slot.date}
                          </div>
                          <div className='flex flex-wrap gap-2'>
                            {slot.times.map((time, timeIndex) => (
                              <span
                                key={timeIndex}
                                className='bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-lg text-sm font-medium shadow-sm'
                              >
                                {time}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* プレーンテキスト表示 */}
                  <div className='bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-2xl p-6 border border-gray-200 dark:border-gray-600'>
                    <div className='flex items-center justify-between mb-4'>
                      <h4 className='text-lg font-semibold text-gray-800 dark:text-white'>
                        プレーンテキスト
                      </h4>
                      <button
                        onClick={copyToClipboard}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                          isCopied
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                            : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 shadow-md hover:shadow-lg'
                        }`}
                      >
                        {isCopied ? (
                          <>
                            <Check className='w-4 h-4' />
                            コピー完了
                          </>
                        ) : (
                          <>
                            <Copy className='w-4 h-4' />
                            クリップボードにコピー
                          </>
                        )}
                      </button>
                    </div>
                    <div className='bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm'>
                      <pre className='text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono'>
                        {generateTextOutput()}
                      </pre>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Scheduler;
