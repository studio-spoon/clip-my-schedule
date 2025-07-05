'use client'

import { useState } from 'react'

export interface ScheduleState {
  selectedMembers: string[]
  selectedPeriod: string
  selectedTimeSlot: string
  customTimeStart: string
  customTimeEnd: string
  meetingDuration: string
  bufferTime: string
  customDuration: string
}

export function useScheduleState() {
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const [selectedPeriod, setSelectedPeriod] = useState('直近2週間')
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('デフォルト')
  const [customTimeStart, setCustomTimeStart] = useState('10:00')
  const [customTimeEnd, setCustomTimeEnd] = useState('17:00')
  const [meetingDuration, setMeetingDuration] = useState('60分')
  const [bufferTime, setBufferTime] = useState('30分')
  const [customDuration, setCustomDuration] = useState('75')

  const handleMemberToggle = (member: string) => {
    setSelectedMembers((prev) =>
      prev.includes(member)
        ? prev.filter((m) => m !== member)
        : [...prev, member]
    )
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
    bufferTime,
    customDuration
  }

  return {
    // State values
    ...scheduleState,
    
    // Actions
    setSelectedMembers,
    setSelectedPeriod,
    setSelectedTimeSlot,
    setCustomTimeStart,
    setCustomTimeEnd,
    setMeetingDuration,
    setBufferTime,
    setCustomDuration,
    handleMemberToggle,
    setInitialMember,
    clearAll,
    
    // Combined state object
    scheduleState
  }
}