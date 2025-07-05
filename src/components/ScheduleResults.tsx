'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

interface ScheduleResultsProps {
  availableSlots?: {date: string, times: string[]}[]
  selectedMembers: string[]
  selectedPeriod: string
  selectedTimeSlot: string
  customTimeStart: string
  customTimeEnd: string
  meetingDuration: string
  bufferTime: string
}

export default function ScheduleResults({
  availableSlots,
  selectedMembers,
  selectedPeriod,
  selectedTimeSlot,
  customTimeStart,
  customTimeEnd,
  meetingDuration,
  bufferTime
}: ScheduleResultsProps) {
  const [isCopied, setIsCopied] = useState(false)
  
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
    output += `前後隙間時間: ${bufferTime}\n\n`
    output += `【空き時間】\n`

    safeAvailableSlots.forEach((slot) => {
      output += `${slot.date}\n`
      slot.times.forEach((time) => {
        output += `  ・${time}\n`
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
        <h4 className='text-lg font-semibold text-gray-800 dark:text-white mb-4'>
          空き時間一覧
        </h4>
        <div className='space-y-4'>
          {safeAvailableSlots.map((slot, index) => (
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
  )
}