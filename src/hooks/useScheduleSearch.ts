'use client'

import { useState } from 'react'
import { api } from '@/services/api'
import type { Member } from '@/types/api'

interface ScheduleSearchParams {
  selectedMembers: string[]
  selectedPeriod: string
  teamMembers: Member[]
}

interface ScheduleSlot {
  date: string
  times: string[]
}

export function useScheduleSearch() {
  const [availableSlots, setAvailableSlots] = useState<ScheduleSlot[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  // サンプル空き時間データ（フォールバック用）
  const sampleAvailableSlots: ScheduleSlot[] = [
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
  ]

  const searchSchedule = async ({ selectedMembers, selectedPeriod, teamMembers }: ScheduleSearchParams) => {
    if (selectedMembers.length === 0) {
      alert('参加者を選択してください。')
      return
    }

    setIsSearching(true)

    try {
      // 検索期間の計算
      const timeMin = new Date()
      const timeMax = new Date()
      
      if (selectedPeriod === '直近1週間') {
        timeMax.setDate(timeMax.getDate() + 7)
      } else if (selectedPeriod === '直近2週間') {
        timeMax.setDate(timeMax.getDate() + 14)
      } else {
        timeMax.setDate(timeMax.getDate() + 30) // デフォルト
      }

      // 参加者のカレンダーIDを抽出
      const emails = selectedMembers.map(memberDisplayName => {
        const member = teamMembers.find(m => m.displayName === memberDisplayName)
        return member ? member.calendarId : ''
      }).filter(email => email)

      // Calendar APIを呼び出し
      const result = await api.calendar.searchAvailableSlots({
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
        emails
      })
      
      if (result.success && result.data) {
        // APIレスポンスを既存の形式に変換
        const formattedSlots = result.data.freeSlots.map((daySlot) => ({
          date: daySlot.date,
          times: daySlot.times,
        }))
        
        setAvailableSlots(formattedSlots)
        setHasSearched(true)
      } else {
        throw new Error(result.error || 'カレンダー情報の取得に失敗しました')
      }
    } catch (error) {
      console.error('検索エラー:', error)
      alert('カレンダー情報の取得に失敗しました。サンプルデータを表示します。')
      setAvailableSlots(sampleAvailableSlots)
      setHasSearched(true)
    } finally {
      setIsSearching(false)
    }
  }

  const clearResults = () => {
    setAvailableSlots([])
    setHasSearched(false)
  }

  return {
    availableSlots,
    isSearching,
    hasSearched,
    searchSchedule,
    clearResults
  }
}