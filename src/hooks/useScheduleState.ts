'use client'

import { useState, useEffect, useCallback } from 'react'
import { UserSettings } from '@/types/settings'

export interface ScheduleState {
  selectedMembers: string[]
  selectedPeriod: string
  selectedTimeSlot: string
  customTimeStart: string
  customTimeEnd: string
  meetingDuration: string
  bufferTimeBefore: string
  bufferTimeAfter: string
  customDuration: string
  customPeriodStart: string
  customPeriodEnd: string
}

export function useScheduleState(userSettings?: UserSettings) {
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const [selectedPeriod, setSelectedPeriod] = useState('直近1週間')
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('デフォルト')
  const [customTimeStart, setCustomTimeStart] = useState('09:00')
  const [customTimeEnd, setCustomTimeEnd] = useState('18:00')
  const [meetingDuration, setMeetingDuration] = useState('60分')
  const [bufferTimeBefore, setBufferTimeBefore] = useState('10分')
  const [bufferTimeAfter, setBufferTimeAfter] = useState('10分')
  const [customDuration, setCustomDuration] = useState('75')
  const [customPeriodStart, setCustomPeriodStart] = useState('')
  const [customPeriodEnd, setCustomPeriodEnd] = useState('')
  const [isInitialized, setIsInitialized] = useState(false)
  const [userHasManuallyChanged, setUserHasManuallyChanged] = useState(false)

  // 設定に基づいたデフォルト値を取得する関数
  const getDefaultTimeValues = useCallback(() => {
    if (!userSettings) {
      return { timeStart: '09:00', timeEnd: '18:00' }
    }
    
    let timeStart = '09:00'
    let timeEnd = '18:00'
    
    switch (userSettings.defaultTimeSlot) {
      case 'デフォルト':
        timeStart = '09:00'
        timeEnd = '18:00'
        break
      case '午前':
        timeStart = '09:00'
        timeEnd = '12:00'
        break
      case '午後':
        timeStart = '13:00'
        timeEnd = '17:00'
        break
      case '夜間':
        timeStart = '18:00'
        timeEnd = '22:00'
        break
      case 'カスタム':
        timeStart = userSettings.customTimeStart || '10:00'
        timeEnd = userSettings.customTimeEnd || '17:00'
        break
      default:
        timeStart = userSettings.customTimeStart || '10:00'
        timeEnd = userSettings.customTimeEnd || '17:00'
    }
    
    return { timeStart, timeEnd }
  }, [userSettings])

  // 初期化時のみ設定を適用する関数
  const applyInitialDefaults = useCallback(() => {
    if (userSettings) {
      const { timeStart, timeEnd } = getDefaultTimeValues()
      // ユーザーのデフォルト時間帯設定を反映
      setSelectedTimeSlot(userSettings.defaultTimeSlot)
      setCustomTimeStart(timeStart)
      setCustomTimeEnd(timeEnd)
      setMeetingDuration(userSettings.defaultMeetingDuration || '60分')
      setBufferTimeBefore(userSettings.defaultBufferBefore || '15分')
      setBufferTimeAfter(userSettings.defaultBufferAfter || '15分')
      setUserHasManuallyChanged(false)
    }
  }, [userSettings, getDefaultTimeValues])

  // ユーザー設定からデフォルト値を適用（初回のみ）
  useEffect(() => {
    if (userSettings && !isInitialized) {
      applyInitialDefaults()
      setIsInitialized(true)
    }
  }, [userSettings, isInitialized, applyInitialDefaults])

  // 設定の更新日時をチェックして設定変更を検知（ユーザーが手動変更していない場合のみ）
  const [lastKnownUpdate, setLastKnownUpdate] = useState<string | undefined>(undefined)
  const lastUpdated = userSettings?.updatedAt
  
  useEffect(() => {
    if (userSettings && isInitialized && lastUpdated && lastUpdated !== lastKnownUpdate) {
      // ユーザーが手動で設定を変更していない場合のみ、設定変更を反映
      if (!userHasManuallyChanged) {
        applyInitialDefaults()
      }
      setLastKnownUpdate(lastUpdated)
    }
  }, [lastUpdated, userSettings, isInitialized, lastKnownUpdate, userHasManuallyChanged, applyInitialDefaults])

  const handleMemberToggle = (member: string) => {
    setSelectedMembers((prev) =>
      prev.includes(member)
        ? prev.filter((m) => m !== member)
        : [...prev, member]
    )
  }

  // 時間帯変更時にユーザーが手動変更したことを記録
  const handleTimeSlotChange = (timeSlot: string) => {
    setSelectedTimeSlot(timeSlot)
    if (timeSlot !== 'デフォルト') {
      setUserHasManuallyChanged(true)
    }
  }

  // 手動時間変更時にユーザーが手動変更したことを記録
  const handleCustomTimeStartChange = (time: string) => {
    setCustomTimeStart(time)
    setUserHasManuallyChanged(true)
  }

  const handleCustomTimeEndChange = (time: string) => {
    setCustomTimeEnd(time)
    setUserHasManuallyChanged(true)
  }

  // 会議時間変更時にユーザーが手動変更したことを記録
  const handleMeetingDurationChange = (duration: string) => {
    setMeetingDuration(duration)
    if (userSettings && duration !== userSettings.defaultMeetingDuration) {
      setUserHasManuallyChanged(true)
    }
  }

  // バッファー時間変更時にユーザーが手動変更したことを記録
  const handleBufferTimeBeforeChange = (buffer: string) => {
    setBufferTimeBefore(buffer)
    if (userSettings && buffer !== userSettings.defaultBufferBefore) {
      setUserHasManuallyChanged(true)
    }
  }

  const handleBufferTimeAfterChange = (buffer: string) => {
    setBufferTimeAfter(buffer)
    if (userSettings && buffer !== userSettings.defaultBufferAfter) {
      setUserHasManuallyChanged(true)
    }
  }

  // デフォルト時間を使用する時の処理
  const useDefaultTime = () => {
    const { timeStart, timeEnd } = getDefaultTimeValues()
    // ユーザーのデフォルト時間帯設定を反映
    setSelectedTimeSlot(userSettings?.defaultTimeSlot || 'デフォルト')
    setCustomTimeStart(timeStart)
    setCustomTimeEnd(timeEnd)
    setUserHasManuallyChanged(false)
  }

  const setInitialMember = (memberDisplayName: string) => {
    setSelectedMembers([memberDisplayName])
  }

  const clearAll = () => {
    setSelectedMembers([])
  }

  const scheduleState: ScheduleState = {
    selectedMembers,
    selectedPeriod,
    selectedTimeSlot,
    customTimeStart,
    customTimeEnd,
    meetingDuration,
    bufferTimeBefore,
    bufferTimeAfter,
    customDuration,
    customPeriodStart,
    customPeriodEnd
  }

  return {
    // State values
    ...scheduleState,
    
    // Actions
    setSelectedMembers,
    setSelectedPeriod,
    setSelectedTimeSlot: handleTimeSlotChange,
    setCustomTimeStart: handleCustomTimeStartChange,
    setCustomTimeEnd: handleCustomTimeEndChange,
    setMeetingDuration: handleMeetingDurationChange,
    setBufferTimeBefore: handleBufferTimeBeforeChange,
    setBufferTimeAfter: handleBufferTimeAfterChange,
    setCustomDuration,
    setCustomPeriodStart,
    setCustomPeriodEnd,
    handleMemberToggle,
    setInitialMember,
    clearAll,
    useDefaultTime,
    getDefaultTimeValues,
    
    // Helper state
    userHasManuallyChanged,
    
    // Combined state object
    scheduleState
  }
}