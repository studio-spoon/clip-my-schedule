'use client'

import { Clock, Settings } from 'lucide-react'

interface ScheduleFormProps {
  selectedPeriod: string
  selectedTimeSlot: string
  customTimeStart: string
  customTimeEnd: string
  meetingDuration: string
  bufferTime: string
  customDuration: string
  isSearching?: boolean
  hasSearched?: boolean
  onPeriodChange: (period: string) => void
  onTimeSlotChange: (slot: string) => void
  onCustomTimeStartChange: (time: string) => void
  onCustomTimeEndChange: (time: string) => void
  onMeetingDurationChange: (duration: string) => void
  onBufferTimeChange: (buffer: string) => void
  onCustomDurationChange: (duration: string) => void
  onSearch: () => void
}

export default function ScheduleForm({
  selectedPeriod,
  selectedTimeSlot,
  customTimeStart,
  customTimeEnd,
  meetingDuration,
  bufferTime,
  customDuration,
  isSearching = false,
  hasSearched = false,
  onPeriodChange,
  onTimeSlotChange,
  onCustomTimeStartChange,
  onCustomTimeEndChange,
  onMeetingDurationChange,
  onBufferTimeChange,
  onCustomDurationChange,
  onSearch
}: ScheduleFormProps) {
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
            onClick={() => onTimeSlotChange('デフォルト')}
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
            onClick={() => onTimeSlotChange('時間指定')}
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
              className='border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            />
            <span className='text-gray-500 dark:text-gray-400 font-medium'>
              〜
            </span>
            <input
              type='time'
              value={customTimeEnd}
              onChange={(e) => onCustomTimeEndChange(e.target.value)}
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
          <div className='flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600'>
            <span className='text-sm text-gray-600 dark:text-gray-400'>
              時間指定
            </span>
            <input
              type='number'
              value={customDuration}
              onChange={(e) => onCustomDurationChange(e.target.value)}
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
              onClick={() => onBufferTimeChange(buffer)}
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
          onClick={onSearch}
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
          <p className='text-sm text-gray-500 dark:text-gray-400 text-center mt-2'>
            💡 設定を変更すると自動的に結果が更新されます
          </p>
        )}
      </div>
    </>
  )
}