'use client'

import { useState, useEffect } from 'react'
import { api } from '@/services/api'
import type { Member } from '@/types/api'

interface AvailableSlot {
  date: string
  times: string[]
  busyTimes?: Array<{ start: string; end: string }>
}

export function useAvailableSlots(
  selectedMembers: string[],
  teamMembers: Member[]
) {
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (selectedMembers.length === 0) {
      setAvailableSlots([])
      return
    }

    const fetchSlots = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // 今日から1週間の範囲を設定
        const timeMin = new Date()
        const timeMax = new Date()
        timeMax.setDate(timeMax.getDate() + 7)

        // 参加者のカレンダーIDを抽出
        const emails = selectedMembers.map(memberDisplayName => {
          const member = teamMembers.find(m => m.displayName === memberDisplayName)
          return member ? member.calendarId : ''
        }).filter(email => email)


        // Calendar APIを呼び出し（基本的な空き時間取得）
        const result = await api.calendar.searchAvailableSlots({
          timeMin: timeMin.toISOString(),
          timeMax: timeMax.toISOString(),
          emails
        }, {
          selectedPeriod: '直近1週間',
          selectedTimeSlot: 'デフォルト',
          customTimeStart: '10:00',
          customTimeEnd: '18:00',
          meetingDuration: '60分',
          bufferTimeBefore: '0分',
          bufferTimeAfter: '0分',
          customDuration: '60',
          customPeriodStart: '',
          customPeriodEnd: ''
        })

        if (result.success && result.data) {
          // APIレスポンスを変換
          const slots = result.data.freeSlots.map((daySlot) => ({
            date: daySlot.date,
            times: daySlot.times,
            busyTimes: daySlot.debug?.slotDetails?.map(d => ({ start: d.slotStart, end: d.slotEnd })) || []
          }))
          
          setAvailableSlots(slots)
        } else {
          throw new Error(result.error || 'カレンダー情報の取得に失敗しました')
        }
      } catch (error) {
        console.error('Available slots fetch error:', error)
        const errorMessage = error instanceof Error ? error.message : '不明なエラーが発生しました。'
        setError(errorMessage)
        setAvailableSlots([])
      } finally {
        setIsLoading(false)
      }
    }

    // デバウンス処理（500ms）
    const timeoutId = setTimeout(() => {
      fetchSlots()
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [selectedMembers, teamMembers])

  return {
    availableSlots,
    isLoading,
    error
  }
}