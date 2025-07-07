'use client';

import { Clock, Settings } from 'lucide-react';
import { useRef } from 'react';
import { UserSettings } from '@/types/settings';

interface ScheduleFormProps {
  selectedPeriod: string;
  selectedTimeSlot: string;
  customTimeStart: string;
  customTimeEnd: string;
  meetingDuration: string;
  bufferTimeBefore: string;
  bufferTimeAfter: string;
  customDuration: string;
  customPeriodStart: string;
  customPeriodEnd: string;
  isSearching?: boolean;
  hasSearched?: boolean;
  onPeriodChange: (period: string) => void;
  onTimeSlotChange: (slot: string) => void;
  onCustomTimeStartChange: (time: string) => void;
  onCustomTimeEndChange: (time: string) => void;
  onMeetingDurationChange: (duration: string) => void;
  onBufferTimeBeforeChange: (buffer: string) => void;
  onBufferTimeAfterChange: (buffer: string) => void;
  onCustomDurationChange: (duration: string) => void;
  onCustomPeriodStartChange: (date: string) => void;
  onCustomPeriodEndChange: (date: string) => void;
  onSearch: (forceRefresh?: boolean) => void;
  userSettings?: UserSettings;
}

export default function ScheduleForm({
  selectedPeriod,
  selectedTimeSlot,
  customTimeStart,
  customTimeEnd,
  meetingDuration,
  bufferTimeBefore,
  bufferTimeAfter,
  customDuration,
  customPeriodStart,
  customPeriodEnd,
  isSearching = false,
  hasSearched = false,
  onPeriodChange,
  onTimeSlotChange,
  onCustomTimeStartChange,
  onCustomTimeEndChange,
  onMeetingDurationChange,
  onBufferTimeBeforeChange,
  onBufferTimeAfterChange,
  onCustomDurationChange,
  onCustomPeriodStartChange,
  onCustomPeriodEndChange,
  onSearch,
  userSettings,
}: ScheduleFormProps) {
  // カスタム所要時間input要素への参照
  const customDurationInputRef = useRef<HTMLInputElement>(null);

  // デフォルト時間のラベルを生成
  const getDefaultTimeLabel = () => {
    if (userSettings) {
      // マイページで設定された時間帯に基づいてラベルを生成
      switch (userSettings.defaultTimeSlot) {
        case 'デフォルト':
          return '09:00-18:00';
        case '午前':
          return '09:00-12:00';
        case '午後':
          return '13:00-17:00';
        case '夜間':
          return '18:00-22:00';
        case 'カスタム':
          return `${userSettings.customTimeStart}-${userSettings.customTimeEnd}`;
        default:
          return `${userSettings.customTimeStart}-${userSettings.customTimeEnd}`;
      }
    }
    return '09:00-18:00';
  };

  // デフォルト会議時間のラベルを生成
  const getDefaultMeetingDurationLabel = () => {
    if (userSettings) {
      return userSettings.defaultMeetingDuration || '60分';
    }
    return '60分';
  };

  return (
    <>
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
              onClick={() => onPeriodChange(period)}
              className={`px-3 md:px-6 py-3 rounded-xl font-medium transition-all duration-200 text-sm md:text-base ${
                selectedPeriod === period
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg transform scale-105'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:shadow-md'
              }`}
            >
              {period}
            </button>
          ))}
        </div>

        {selectedPeriod === '期間を指定' && (
          <div className='mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600'>
            <div className='flex gap-4 items-center'>
              <div className='flex flex-col'>
                <label className='text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                  開始日
                </label>
                <input
                  type='date'
                  value={customPeriodStart}
                  onChange={(e) => onCustomPeriodStartChange(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className='border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent'
                />
              </div>
              <span className='text-gray-500 dark:text-gray-400 font-medium mt-6'>
                〜
              </span>
              <div className='flex flex-col'>
                <label className='text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                  終了日
                </label>
                <input
                  type='date'
                  value={customPeriodEnd}
                  onChange={(e) => onCustomPeriodEndChange(e.target.value)}
                  min={
                    customPeriodStart || new Date().toISOString().split('T')[0]
                  }
                  className='border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent'
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 時間帯 */}
      <div className='mb-8'>
        <div className='flex items-center gap-3 mb-4'>
          <div className='w-3 h-3 bg-gradient-to-r from-green-400 to-blue-500 rounded-full shadow-sm'></div>
          <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
            時間帯
          </h3>
          <a
            href='/mypage'
            className='flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline'
            title='マイページでデフォルト設定を管理'
          >
            <Settings className='w-4 h-4' />
            デフォルト設定
          </a>
        </div>

        <div className='flex flex-wrap gap-3 mb-4'>
          <button
            onClick={() => {
              // ユーザーのデフォルト時間帯設定を反映
              const timeSlot = userSettings?.defaultTimeSlot || 'デフォルト';
              onTimeSlotChange(timeSlot);
              // デフォルト時間を適用するためのトリガー
              if (userSettings) {
                const { timeStart, timeEnd } = (() => {
                  switch (userSettings.defaultTimeSlot) {
                    case 'デフォルト': return { timeStart: '09:00', timeEnd: '18:00' };
                    case '午前': return { timeStart: '09:00', timeEnd: '12:00' };
                    case '午後': return { timeStart: '13:00', timeEnd: '17:00' };
                    case '夜間': return { timeStart: '18:00', timeEnd: '22:00' };
                    case 'カスタム': return { timeStart: userSettings.customTimeStart || '09:00', timeEnd: userSettings.customTimeEnd || '18:00' };
                    default: return { timeStart: '09:00', timeEnd: '18:00' };
                  }
                })();
                onCustomTimeStartChange(timeStart);
                onCustomTimeEndChange(timeEnd);
              }
            }}
            className={`px-6 py-4 rounded-xl font-medium transition-all duration-200 ${
              selectedTimeSlot === (userSettings?.defaultTimeSlot || 'デフォルト')
                ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:shadow-md'
            }`}
          >
            <div className='text-center'>
              <div>デフォルト</div>
              <div className='text-sm opacity-90'>{getDefaultTimeLabel()}</div>
            </div>
          </button>
          <button
            onClick={() => {
              onTimeSlotChange('時間指定');
            }}
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
              onChange={(e) => onCustomTimeStartChange(e.target.value)}
              className='border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:[color-scheme:dark]'
            />
            <span className='text-gray-500 dark:text-gray-400 font-medium'>
              〜
            </span>
            <input
              type='time'
              value={customTimeEnd}
              onChange={(e) => onCustomTimeEndChange(e.target.value)}
              className='border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:[color-scheme:dark]'
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
          {/* デフォルト会議時間ボタン */}
          <button
            onClick={() => onMeetingDurationChange(getDefaultMeetingDurationLabel())}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
              meetingDuration === getDefaultMeetingDurationLabel()
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg transform scale-105'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:shadow-md'
            }`}
          >
            <div className='text-center'>
              <div>デフォルト</div>
              <div className='text-xs opacity-90'>({getDefaultMeetingDurationLabel()})</div>
            </div>
          </button>
          {/* 固定の時間選択肢 */}
          {['15分', '30分', '45分', '60分'].filter(duration => duration !== getDefaultMeetingDurationLabel()).map((duration) => (
            <button
              key={duration}
              onClick={() => onMeetingDurationChange(duration)}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                meetingDuration === duration
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg transform scale-105'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:shadow-md'
              }`}
            >
              {duration}
            </button>
          ))}
          <div
            className={`flex items-center gap-2 p-3 rounded-xl border transition-all duration-200 cursor-pointer ${
              meetingDuration === 'カスタム'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-transparent shadow-lg transform scale-105'
                : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
            }`}
            onClick={() => {
              // div全体をクリックしたときにカスタムモードに切り替える
              onMeetingDurationChange('カスタム');
              // input要素にフォーカスも移す
              if (customDurationInputRef.current) {
                customDurationInputRef.current.focus();
              }
            }}
          >
            <span
              className={`text-sm ${
                meetingDuration === 'カスタム'
                  ? 'text-white'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              時間指定
            </span>
            <input
              ref={customDurationInputRef}
              type='number'
              value={customDuration}
              onChange={(e) => {
                onCustomDurationChange(e.target.value);
                // カスタム値が変更されたらmeetingDurationも更新
                onMeetingDurationChange('カスタム');
              }}
              onFocus={() => {
                // フォーカス時にもカスタムモードに切り替え
                onMeetingDurationChange('カスタム');
              }}
              className={`w-16 border rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                meetingDuration === 'カスタム'
                  ? 'border-white/30 bg-white/20 text-white placeholder-white/60'
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
              }`}
            />
            <span
              className={`text-sm ${
                meetingDuration === 'カスタム'
                  ? 'text-white'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              分
            </span>
          </div>
        </div>
      </div>

      {/* 前後余白 */}
      <div className='mb-8'>
        <div className='flex items-center gap-3 mb-4'>
          <div className='w-3 h-3 bg-gradient-to-r from-red-400 to-pink-500 rounded-full shadow-sm'></div>
          <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
            前後余白
          </h3>
        </div>
        <div className='grid grid-cols-2 gap-4'>
          <div>
            <label className='text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block'>
              前の余白時間
            </label>
            <div className='flex flex-wrap gap-3'>
              {['0分', '10分', '20分', '30分'].map((buffer) => {
                const isActive = bufferTimeBefore === buffer;
                return (
                  <button
                    key={`before-${buffer}`}
                    onClick={() => onBufferTimeBeforeChange(buffer)}
                    className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 text-sm ${
                      isActive
                        ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg transform scale-105'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:shadow-md'
                    }`}
                  >
                    {buffer}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className='text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block'>
              後に空ける
            </label>
            <div className='flex flex-wrap gap-3'>
              {['0分', '10分', '20分', '30分'].map((buffer) => (
                <button
                  key={`after-${buffer}`}
                  onClick={() => onBufferTimeAfterChange(buffer)}
                  className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 text-sm ${
                    bufferTimeAfter === buffer
                      ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg transform scale-105'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:shadow-md'
                  }`}
                >
                  {buffer}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 検索ボタン */}
      <div className='mb-8'>
        <button
          onClick={() => onSearch(false)}
          disabled={isSearching}
          className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-200 shadow-lg flex items-center justify-center gap-3 ${
            isSearching
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 hover:shadow-xl'
          }`}
        >
          {isSearching ? (
            <>
              <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white'></div>
              検索中...
            </>
          ) : (
            <>
              <Clock className='w-5 h-5' />
              {hasSearched ? '結果を更新' : '空き時間を検索'}
            </>
          )}
        </button>

        {hasSearched && !isSearching && (
          <div className='text-sm text-gray-500 dark:text-gray-400 text-center mt-2'>
            <p>💡 設定を変更すると自動的に結果が更新されます</p>
          </div>
        )}
      </div>
    </>
  );
}
