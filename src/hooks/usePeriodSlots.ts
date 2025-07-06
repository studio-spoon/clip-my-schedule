'use client'

import { useState, useEffect } from 'react'
import { api } from '@/services/api'
import type { Member } from '@/types/api'

interface PeriodSlot {
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

interface UsePeriodSlotsParams {
  selectedMembers: string[]
  teamMembers: Member[]
  selectedPeriod: string
  customPeriodStart: string
  customPeriodEnd: string
}

export function usePeriodSlots({
  selectedMembers,
  teamMembers,
  selectedPeriod,
  customPeriodStart,
  customPeriodEnd
}: UsePeriodSlotsParams) {
  const [periodSlots, setPeriodSlots] = useState<PeriodSlot[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (selectedMembers.length === 0) {
      setPeriodSlots([])
      return
    }

    const fetchPeriodSlots = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // 期間の計算
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
            setPeriodSlots([])
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

        // 参加者のカレンダーIDを抽出
        const emails = selectedMembers.map(memberDisplayName => {
          const member = teamMembers.find(m => m.displayName === memberDisplayName)
          return member ? member.calendarId : ''
        }).filter(email => email)

        console.log('🔍 Fetching period slots:')
        console.log('   Selected period:', selectedPeriod)
        console.log('   Time range:', timeMin.toISOString(), 'to', timeMax.toISOString())
        console.log('   Members:', selectedMembers)
        console.log('   Email addresses:', emails)

        // Calendar APIを呼び出し（期間を反映）
        const result = await api.calendar.searchAvailableSlots({
          timeMin: timeMin.toISOString(),
          timeMax: timeMax.toISOString(),
          emails
        }, {
          selectedPeriod,
          selectedTimeSlot: 'デフォルト', // デフォルト時間帯
          customTimeStart: '10:00',
          customTimeEnd: '18:00',
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
          
          console.log('✅ Period slots fetched:', slots)
          setPeriodSlots(slots)
        } else {
          throw new Error(result.error || 'カレンダー情報の取得に失敗しました')
        }
      } catch (error) {
        console.error('Period slots fetch error:', error)
        const errorMessage = error instanceof Error ? error.message : '不明なエラーが発生しました。'
        setError(errorMessage)
        setPeriodSlots([])
      } finally {
        setIsLoading(false)
      }
    }

    // デバウンス処理（300ms）
    const timeoutId = setTimeout(() => {
      fetchPeriodSlots()
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [selectedMembers, teamMembers, selectedPeriod, customPeriodStart, customPeriodEnd])

  return {
    periodSlots,
    isLoading,
    error
  }
}