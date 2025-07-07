'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { mergeDaySlots, formatMergedTimeSlot } from '@/utils/timeSlotMerger'
import { UserSettings } from '@/types/settings'

interface ScheduleSlot {
  date: string
  times: string[]
  debug?: {
    slotDetails?: Array<{
      time: string
      duration: number
      bufferBefore: number
      bufferAfter: number
      slotStart: string
      slotEnd: string
      totalDuration: number
    }>
  }
}

interface ScheduleResultsProps {
  availableSlots?: ScheduleSlot[]
  selectedMembers: string[]
  selectedPeriod: string
  selectedTimeSlot: string
  customTimeStart: string
  customTimeEnd: string
  meetingDuration: string
  bufferTimeBefore: string
  bufferTimeAfter: string
  userSettings?: UserSettings
}

export default function ScheduleResults({
  availableSlots,
  selectedMembers,
  selectedPeriod,
  selectedTimeSlot,
  customTimeStart,
  customTimeEnd,
  meetingDuration,
  bufferTimeBefore,
  bufferTimeAfter,
  userSettings
}: ScheduleResultsProps) {
  const [isCopied, setIsCopied] = useState(false)
  
  // 安全なデフォルト値
  const safeAvailableSlots = availableSlots || []

  const generateTextOutput = () => {
    // selectedMembersが空の場合の安全な処理
    const memberList = selectedMembers.length > 0 ? selectedMembers.join(', ') : '（参加者が選択されていません）'
    
    // デフォルト時間帯の正確な表示
    const getTimeRange = () => {
      if (selectedTimeSlot === 'デフォルト' && userSettings) {
        switch (userSettings.defaultTimeSlot) {
          case 'デフォルト': return '09:00-18:00'
          case '午前': return '09:00-12:00'
          case '午後': return '13:00-17:00'
          case '夜間': return '18:00-22:00'
          case 'カスタム': return `${userSettings.customTimeStart}-${userSettings.customTimeEnd}`
          default: return `${userSettings.customTimeStart}-${userSettings.customTimeEnd}`
        }
      }
      return `${customTimeStart}-${customTimeEnd}`
    }
    
    const timeRange = getTimeRange()

    let output = `【スケジュール調整】\n\n`
    output += `対象メンバー: ${memberList}\n`
    output += `期間: ${selectedPeriod}\n`
    output += `時間帯: ${timeRange}\n`
    output += `所要時間: ${meetingDuration}\n`
    output += `前の余白時間: ${bufferTimeBefore}\n`
    output += `後の余白時間: ${bufferTimeAfter}\n\n`
    output += `【空き時間】\n`

    mergeDaySlots(safeAvailableSlots).forEach((slot) => {
      output += `${slot.date}\n`
      slot.mergedTimes.forEach((time) => {
        output += `  ・${formatMergedTimeSlot(time)}\n`
      })
      output += '\n'
    })

    return output
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generateTextOutput())
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (err) {
    }
  }

  if (safeAvailableSlots.length === 0) {
    return null
  }

  return (
    <div className='border-t border-gray-200 dark:border-gray-700 pt-8'>
      <h3 className='text-2xl font-bold text-gray-900 dark:text-white mb-6'>
        検索結果
      </h3>

      {/* 空き時間リスト */}
      <div className='bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-2xl p-6 mb-6 border border-gray-200 dark:border-gray-600'>
        <div className='mb-4'>
          <h4 className='text-lg font-semibold text-gray-800 dark:text-white'>
            空き時間一覧
          </h4>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'>
          {mergeDaySlots(safeAvailableSlots).map((slot, index) => (
            <div key={index} className='bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700'>
              <div className='font-medium text-gray-900 dark:text-white text-sm mb-2'>
                {slot.date}
              </div>
              <div className='space-y-1'>
                {slot.mergedTimes.map((time, timeIndex) => (
                  <div
                    key={timeIndex}
                    className='bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded text-xs font-medium'
                  >
                    {formatMergedTimeSlot(time)}
                  </div>
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
  )
}