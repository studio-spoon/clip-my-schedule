'use client'

import { useState, useEffect } from 'react'
import { api } from '@/services/api'
import type { Member } from '@/types/api'

interface TimeSlot {
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

interface UseTimeSlotsParams {
  selectedMembers: string[]
  teamMembers: Member[]
  selectedPeriod: string
  customPeriodStart: string
  customPeriodEnd: string
  selectedTimeSlot: string
  customTimeStart: string
  customTimeEnd: string
}

export function useTimeSlots({
  selectedMembers,
  teamMembers,
  selectedPeriod,
  customPeriodStart,
  customPeriodEnd,
  selectedTimeSlot,
  customTimeStart,
  customTimeEnd
}: UseTimeSlotsParams) {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (selectedMembers.length === 0) {
      setTimeSlots([])
      return
    }

    const fetchTimeSlots = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // 期間の計算（usePeriodSlotsと同じロジック）
        let timeMin: Date
        let timeMax: Date

        if (selectedPeriod === '直近1週間') {
          timeMin = new Date()
          timeMax = new Date()
          timeMax.setDate(timeMax.getDate() + 7)
        } else if (selectedPeriod === '直近2週間') {
          timeMin = new Date()
          timeMax = new Date()
          timeMax.setDate(timeMax.getDate() + 14)
        } else if (selectedPeriod === '期間を指定') {
          if (!customPeriodStart || !customPeriodEnd) {
            console.log('期間指定が選択されていますが、開始日または終了日が未入力です。')
            setTimeSlots([])
            setIsLoading(false)
            return
          }
          timeMin = new Date(customPeriodStart)
          timeMax = new Date(customPeriodEnd)
          timeMax.setHours(23, 59, 59, 999) // 終了日の終わりまで
        } else {
          // デフォルトは直近1週間
          timeMin = new Date()
          timeMax = new Date()
          timeMax.setDate(timeMax.getDate() + 7)
        }

        // 時間帯の処理
        let workingTimeStart = '10:00'
        let workingTimeEnd = '18:00'
        
        if (selectedTimeSlot === 'デフォルト') {
          workingTimeStart = '10:00'
          workingTimeEnd = '17:00'
        } else if (selectedTimeSlot === '時間指定') {
          workingTimeStart = customTimeStart || '10:00'
          workingTimeEnd = customTimeEnd || '18:00'
        }

        // 参加者のカレンダーIDを抽出
        const emails = selectedMembers.map(memberDisplayName => {
          const member = teamMembers.find(m => m.displayName === memberDisplayName)
          return member ? member.calendarId : ''
        }).filter(email => email)

        console.log('🔍 Fetching time slots:')
        console.log('   Selected period:', selectedPeriod)
        console.log('   Time range:', timeMin.toISOString(), 'to', timeMax.toISOString())
        console.log('   Selected time slot:', selectedTimeSlot)
        console.log('   Working hours:', workingTimeStart, '-', workingTimeEnd)
        console.log('   Members:', selectedMembers)
        console.log('   Email addresses:', emails)

        // Calendar APIを呼び出し（期間と時間帯を反映）
        const result = await api.calendar.searchAvailableSlots({
          timeMin: timeMin.toISOString(),
          timeMax: timeMax.toISOString(),
          emails
        }, {
          selectedPeriod,
          selectedTimeSlot,
          customTimeStart: workingTimeStart,
          customTimeEnd: workingTimeEnd,
          meetingDuration: '60分',
          bufferTimeBefore: '0分',
          bufferTimeAfter: '0分',
          customDuration: '60',
          customPeriodStart,
          customPeriodEnd
        })

        if (result.success && result.data) {
          // APIレスポンスを変換
          const slots = result.data.freeSlots.map((daySlot) => ({
            date: daySlot.date,
            times: daySlot.times,
            debug: daySlot.debug
          }))
          
          console.log('✅ Time slots fetched:', slots)
          setTimeSlots(slots)
        } else {
          throw new Error(result.error || 'カレンダー情報の取得に失敗しました')
        }
      } catch (error) {
        console.error('Time slots fetch error:', error)
        const errorMessage = error instanceof Error ? error.message : '不明なエラーが発生しました。'
        setError(errorMessage)
        setTimeSlots([])
      } finally {
        setIsLoading(false)
      }
    }

    // デバウンス処理（300ms）
    const timeoutId = setTimeout(() => {
      fetchTimeSlots()
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [
    selectedMembers, 
    teamMembers, 
    selectedPeriod, 
    customPeriodStart, 
    customPeriodEnd,
    selectedTimeSlot,
    customTimeStart,
    customTimeEnd
  ])

  return {
    timeSlots,
    isLoading,
    error
  }
}