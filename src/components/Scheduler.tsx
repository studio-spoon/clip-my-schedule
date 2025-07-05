'use client';

import React, { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Calendar, LogOut, Sun, Moon, Monitor } from 'lucide-react';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { useMembers } from '@/hooks/useMembers';
import LoginForm from '@/components/LoginForm';
import MemberSelection from '@/components/MemberSelection';
import ScheduleForm from '@/components/ScheduleForm';
import ScheduleResults from '@/components/ScheduleResults';

function SchedulerContent() {
  // NextAuth.jsセッション管理
  const { data: session, status } = useSession();
  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated';
  const { theme, isDark, setTheme } = useTheme();

  // アプリケーション状態
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('直近2週間');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('デフォルト');
  const [customTimeStart, setCustomTimeStart] = useState('10:00');
  const [customTimeEnd, setCustomTimeEnd] = useState('17:00');
  const [meetingDuration, setMeetingDuration] = useState('60分');
  const [bufferTime, setBufferTime] = useState('30分');
  const [availableSlots, setAvailableSlots] = useState<{date: string, times: string[]}[]>([]);
  const [customDuration, setCustomDuration] = useState('75');
  
  // メンバー関連のカスタムフック
  const { teamMembers, isLoading: isMembersLoading, error: membersError, refetch: refetchMembers } = useMembers();

  // セッション初期化
  useEffect(() => {
    if (session?.user && teamMembers.length > 0) {
      // 自分を最初に選択状態にする
      const currentUser = teamMembers.find((member) => 
        member.email === session?.user?.email
      );
      if (currentUser) {
        setSelectedMembers([currentUser.displayName]);
      }
    }
  }, [session, teamMembers]);


  // ログアウト
  const handleLogout = () => {
    setSelectedMembers([]);
    setAvailableSlots([]);
    signOut();
  };

  // 削除: サンプルデータは上記のuseStateで管理

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

  const handleSearch = async () => {
    if (selectedMembers.length === 0) {
      alert('参加者を選択してください。');
      return;
    }

    try {
      // 検索期間の計算
      const timeMin = new Date();
      const timeMax = new Date();
      
      if (selectedPeriod === '直近1週間') {
        timeMax.setDate(timeMax.getDate() + 7);
      } else if (selectedPeriod === '直近2週間') {
        timeMax.setDate(timeMax.getDate() + 14);
      } else {
        timeMax.setDate(timeMax.getDate() + 30); // デフォルト
      }

      // 参加者のカレンダーIDを抽出
      const emails = selectedMembers.map(memberDisplayName => {
        const member = teamMembers.find(m => m.displayName === memberDisplayName);
        return member ? member.calendarId : '';
      }).filter(email => email);

      // Calendar APIを呼び出し
      const response = await fetch(`/api/calendar?timeMin=${timeMin.toISOString()}&timeMax=${timeMax.toISOString()}&emails=${emails.join(',')}`);
      
      if (!response.ok) {
        throw new Error('カレンダー情報の取得に失敗しました');
      }

      const data = await response.json();
      
      if (data.success) {
        // APIレスポンスを既存の形式に変換
        const formattedSlots = data.data.freeSlots.map((daySlot: { date: string; slots: Array<{ time: string }> }) => ({
          date: daySlot.date,
          times: daySlot.slots.map((slot: { time: string }) => slot.time),
        }));
        
        setAvailableSlots(formattedSlots);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('検索エラー:', error);
      alert('カレンダー情報の取得に失敗しました。サンプルデータを表示します。');
      setAvailableSlots(sampleAvailableSlots);
    }
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
    return <LoginForm isLoading={isLoading} />;
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
                  onClick={handleLogout}
                  className='p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-red-500 transition-colors'
                >
                  <LogOut className='w-5 h-5' />
                </button>
              </div>
            </div>

            {/* メインコンテンツ */}
            <div className='bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8 backdrop-blur-sm'>
              <MemberSelection
                teamMembers={teamMembers}
                selectedMembers={selectedMembers}
                isLoading={isMembersLoading}
                error={membersError}
                onMemberToggle={handleMemberToggle}
                onRetry={refetchMembers}
              />
              
              <ScheduleForm
                selectedPeriod={selectedPeriod}
                selectedTimeSlot={selectedTimeSlot}
                customTimeStart={customTimeStart}
                customTimeEnd={customTimeEnd}
                meetingDuration={meetingDuration}
                bufferTime={bufferTime}
                customDuration={customDuration}
                onPeriodChange={setSelectedPeriod}
                onTimeSlotChange={setSelectedTimeSlot}
                onCustomTimeStartChange={setCustomTimeStart}
                onCustomTimeEndChange={setCustomTimeEnd}
                onMeetingDurationChange={setMeetingDuration}
                onBufferTimeChange={setBufferTime}
                onCustomDurationChange={setCustomDuration}
                onSearch={handleSearch}
              />
              
              <ScheduleResults
                availableSlots={availableSlots}
                selectedMembers={selectedMembers}
                selectedPeriod={selectedPeriod}
                selectedTimeSlot={selectedTimeSlot}
                customTimeStart={customTimeStart}
                customTimeEnd={customTimeEnd}
                meetingDuration={meetingDuration}
                bufferTime={bufferTime}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SchedulerContent;
