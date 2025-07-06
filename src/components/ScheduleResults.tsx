'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { mergeDaySlots, formatMergedTimeSlot } from '@/utils/timeSlotMerger'

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
  bufferTimeAfter
}: ScheduleResultsProps) {
  const [isCopied, setIsCopied] = useState(false)
  const [showDebug, setShowDebug] = useState(true) // デバッグ情報を表示
  
  // 安全なデフォルト値
  const safeAvailableSlots = availableSlots || []

  const generateTextOutput = () => {
    const memberList = selectedMembers.join(', ')
    const timeRange =
      selectedTimeSlot === 'デフォルト'
        ? '10:00-17:00'
        : `${customTimeStart}-${customTimeEnd}`

    let output = `【スケジュール調整】\n\n`
    output += `対象メンバー: ${memberList}\n`
    output += `期間: ${selectedPeriod}\n`
    output += `時間帯: ${timeRange}\n`
    output += `所要時間: ${meetingDuration}\n`
    output += `前に空ける時間: ${bufferTimeBefore}\n`
    output += `後に空ける時間: ${bufferTimeAfter}\n\n`
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
      console.error('クリップボードへのコピーに失敗しました:', err)
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
        <div className='flex items-center justify-between mb-4'>
          <h4 className='text-lg font-semibold text-gray-800 dark:text-white'>
            空き時間一覧
          </h4>
          <button
            onClick={() => setShowDebug(!showDebug)}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
              showDebug
                ? 'bg-yellow-500 text-white shadow-md'
                : 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-400 dark:hover:bg-gray-500'
            }`}
          >
            {showDebug ? '🔧 デバッグ表示中' : '🔧 デバッグ表示'}
          </button>
        </div>
        <div className='space-y-4'>
          {mergeDaySlots(safeAvailableSlots).map((slot, index) => (
            <div
              key={index}
              className='bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700'
            >
              <div className='font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2'>
                {slot.date}
                {slot.originalCount > 0 && (
                  <span className='text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded'>
                    {slot.originalCount}個の時間枠から統合
                  </span>
                )}
              </div>
              <div className='space-y-2'>
                {slot.mergedTimes.map((time, timeIndex) => (
                  <div
                    key={timeIndex}
                    className='bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-3 rounded-lg text-sm font-medium shadow-sm'
                  >
                    {formatMergedTimeSlot(time)}
                  </div>
                ))}
              </div>
              {showDebug && (
                <div className='mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg'>
                  <div className='text-xs text-gray-600 dark:text-gray-400 font-medium mb-2'>🔧 デバッグ情報:</div>
                  <div className='text-xs text-gray-600 dark:text-gray-400'>
                    元の時間枠数: {slot.originalCount}個<br />
                    統合後: {slot.mergedTimes.length}個の連続した空き時間
                  </div>
                </div>
              )}
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