// Schedule parameter processing and validation

export interface ScheduleParams {
  selectedPeriod: string
  selectedTimeSlot: string
  customTimeStart: string
  customTimeEnd: string
  meetingDuration: string
  bufferTimeBefore: string
  bufferTimeAfter: string
  customDuration: string
  customPeriodStart?: string
  customPeriodEnd?: string
}

export interface ProcessedScheduleParams {
  timeRange: {
    start: Date
    end: Date
  }
  workingHours: {
    start: number
    end: number
  }
  meetingDuration: number // in minutes
  bufferTimeBefore: number // in minutes
  bufferTimeAfter: number // in minutes
  totalSlotDuration: number // meeting + buffer time
}

export function processScheduleParams(params: ScheduleParams): ProcessedScheduleParams {
  console.log(`📋 Processing schedule parameters:`, params)
  
  // 1. Process time period
  const now = new Date()
  let startDate = new Date()
  let endDate = new Date()
  
  switch (params.selectedPeriod) {
    case '直近1週間':
      endDate.setDate(endDate.getDate() + 7)
      break
    case '直近2週間':
      endDate.setDate(endDate.getDate() + 14)
      break
    case '期間を指定':
      if (params.customPeriodStart && params.customPeriodEnd) {
        try {
          startDate = new Date(params.customPeriodStart)
          endDate = new Date(params.customPeriodEnd)
          // Ensure the time is set to the end of the day
          endDate.setHours(23, 59, 59, 999)

          if (startDate > endDate) {
            console.warn(`⚠️ Invalid custom period: start date is after end date. Using default.`)
            startDate = new Date()
            endDate = new Date()
            endDate.setDate(endDate.getDate() + 14)
          }
        } catch (error) {
          console.warn(`⚠️ Failed to parse custom period. Using default.`)
          endDate.setDate(endDate.getDate() + 14)
        }
      } else {
        // Fallback if custom dates are not provided
        endDate.setDate(endDate.getDate() + 14)
      }
      break
    default:
      endDate.setDate(endDate.getDate() + 14)
  }
  
  // 2. Process working hours
  let workStart = 10 // Default 10:00
  let workEnd = 17   // Default 17:00
  
  if (params.selectedTimeSlot === '時間指定' && params.customTimeStart && params.customTimeEnd) {
    try {
      workStart = parseInt(params.customTimeStart.split(':')[0])
      workEnd = parseInt(params.customTimeEnd.split(':')[0])
      
      if (workStart < 0 || workStart > 23 || workEnd < 0 || workEnd > 23 || workStart >= workEnd) {
        console.warn(`⚠️ Invalid working hours: ${params.customTimeStart}-${params.customTimeEnd}, using defaults`)
        workStart = 10
        workEnd = 17
      }
    } catch (error) {
      console.warn(`⚠️ Failed to parse working hours: ${params.customTimeStart}-${params.customTimeEnd}`)
      workStart = 10
      workEnd = 17
    }
  }
  
  // 3. Process meeting duration
  let meetingDuration = 60 // Default 60 minutes
  
  if (params.meetingDuration && params.meetingDuration !== 'カスタム') {
    try {
      meetingDuration = parseInt(params.meetingDuration.replace('分', ''))
    } catch (error) {
      console.warn(`⚠️ Failed to parse meeting duration: ${params.meetingDuration}`)
    }
  } else if (params.customDuration) {
    try {
      meetingDuration = parseInt(params.customDuration)
    } catch (error) {
      console.warn(`⚠️ Failed to parse custom duration: ${params.customDuration}`)
    }
  }
  
  // 4. Process buffer time
  let bufferTimeBefore = 0 // Default 0 minutes
  let bufferTimeAfter = 0 // Default 0 minutes
  
  if (params.bufferTimeBefore) {
    try {
      bufferTimeBefore = parseInt(params.bufferTimeBefore.replace('分', ''))
    } catch (error) {
      console.warn(`⚠️ Failed to parse buffer time before: ${params.bufferTimeBefore}`)
    }
  }
  if (params.bufferTimeAfter) {
    try {
      bufferTimeAfter = parseInt(params.bufferTimeAfter.replace('分', ''))
    } catch (error) {
      console.warn(`⚠️ Failed to parse buffer time after: ${params.bufferTimeAfter}`)
    }
  }
  
  const processed: ProcessedScheduleParams = {
    timeRange: {
      start: startDate,
      end: endDate
    },
    workingHours: {
      start: workStart,
      end: workEnd
    },
    meetingDuration,
    bufferTimeBefore,
    bufferTimeAfter,
    totalSlotDuration: bufferTimeBefore + meetingDuration + bufferTimeAfter
  }
  
  console.log(`✅ Processed parameters:`, {
    period: `${startDate.toDateString()} to ${endDate.toDateString()}`,
    workingHours: `${workStart}:00-${workEnd}:00`,
    meetingDuration: `${meetingDuration} minutes`,
    bufferTimeBefore: `${bufferTimeBefore} minutes`,
    bufferTimeAfter: `${bufferTimeAfter} minutes`,
    totalSlotDuration: `${processed.totalSlotDuration} minutes`
  })
  
  return processed
}

export function validateScheduleParams(params: ScheduleParams): {
  isValid: boolean
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []
  
  // Validate period selection
  if (params.selectedPeriod === '期間を指定') {
    if (!params.customPeriodStart || !params.customPeriodEnd) {
      errors.push('カスタム期間が指定されていません')
    } else {
      try {
        const start = new Date(params.customPeriodStart)
        const end = new Date(params.customPeriodEnd)
        if (start > end) {
          errors.push('開始日は終了日より前である必要があります')
        }
      } catch (error) {
        errors.push('期間の形式が無効です')
      }
    }
  }

  // Validate time slot selection
  if (params.selectedTimeSlot === '時間指定') {
    if (!params.customTimeStart || !params.customTimeEnd) {
      errors.push('カスタム時間が指定されていません')
    } else {
      try {
        const start = parseInt(params.customTimeStart.split(':')[0])
        const end = parseInt(params.customTimeEnd.split(':')[0])
        
        if (start >= end) {
          errors.push('開始時間は終了時間より前である必要があります')
        }
        
        if (end - start < 1) {
          warnings.push('作業時間が短すぎる可能性があります')
        }
      } catch (error) {
        errors.push('時間形式が無効です')
      }
    }
  }
  
  // Validate meeting duration
  if (params.meetingDuration === 'カスタム' && params.customDuration) {
    try {
      const duration = parseInt(params.customDuration)
      if (duration <= 0) {
        errors.push('会議時間は0より大きい必要があります')
      }
      if (duration > 480) { // 8 hours
        warnings.push('会議時間が非常に長く設定されています')
      }
    } catch (error) {
      errors.push('カスタム会議時間の形式が無効です')
    }
  }
  
  // Validate buffer time
  if (params.bufferTimeBefore) {
    try {
      const buffer = parseInt(params.bufferTimeBefore.replace('分', ''))
      if (buffer < 0) {
        errors.push('前の隙間時間は0以上である必要があります')
      }
      if (buffer > 120) { // 2 hours
        warnings.push('前の隙間時間が非常に長く設定されています')
      }
    } catch (error) {
      errors.push('前の隙間時間の形式が無効です')
    }
  }
  if (params.bufferTimeAfter) {
    try {
      const buffer = parseInt(params.bufferTimeAfter.replace('分', ''))
      if (buffer < 0) {
        errors.push('後の隙間時間は0以上である必要があります')
      }
      if (buffer > 120) { // 2 hours
        warnings.push('後の隙間時間が非常に長く設定されています')
      }
    } catch (error) {
      errors.push('後の隙間時間の形式が無効です')
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}