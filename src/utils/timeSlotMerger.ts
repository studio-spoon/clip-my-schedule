// 時間枠をマージして連続した空き時間を表示するためのユーティリティ

interface TimeSlot {
  start: string // "12:00"
  end: string   // "13:00"
}

interface MergedTimeSlot {
  start: string
  end: string
  duration: string // "4時間空いています"
}

/**
 * 時間文字列を分に変換
 * "12:30" -> 750
 */
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

/**
 * 分を時間文字列に変換
 * 750 -> "12:30"
 */
// function minutesToTime(minutes: number): string {
//   const hours = Math.floor(minutes / 60)
//   const mins = minutes % 60
//   return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
// }

/**
 * 時間枠文字列を解析
 * "12:00 - 13:00" -> { start: "12:00", end: "13:00" }
 */
function parseTimeSlot(timeSlotString: string): TimeSlot | null {
  const match = timeSlotString.match(/(\d{1,2}:\d{2})\s*[-~]\s*(\d{1,2}:\d{2})/)
  if (!match) return null
  
  return {
    start: match[1],
    end: match[2]
  }
}

/**
 * 時間の長さを人間が読みやすい形式に変換
 */
function formatDuration(startMinutes: number, endMinutes: number): string {
  const totalMinutes = endMinutes - startMinutes
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  
  if (hours === 0) {
    return `${minutes}分間空いています`
  } else if (minutes === 0) {
    return `${hours}時間空いています`
  } else {
    return `${hours}時間${minutes}分間空いています`
  }
}

/**
 * 連続した時間枠をマージ
 */
export function mergeConsecutiveTimeSlots(timeSlots: string[]): MergedTimeSlot[] {
  if (timeSlots.length === 0) return []

  // 時間枠を解析してソート
  const parsedSlots: TimeSlot[] = timeSlots
    .map(parseTimeSlot)
    .filter((slot): slot is TimeSlot => slot !== null)
    .sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start))

  if (parsedSlots.length === 0) return []

  const mergedSlots: MergedTimeSlot[] = []
  let currentStart = parsedSlots[0].start
  let currentEnd = parsedSlots[0].end

  for (let i = 1; i < parsedSlots.length; i++) {
    const slot = parsedSlots[i]
    const currentEndMinutes = timeToMinutes(currentEnd)
    const slotStartMinutes = timeToMinutes(slot.start)

    // 現在の枠の終了時刻と次の枠の開始時刻が連続または重複している場合はマージ
    if (slotStartMinutes <= currentEndMinutes + 15) { // 15分以内なら連続とみなす
      // 終了時刻を延長
      const slotEndMinutes = timeToMinutes(slot.end)
      if (slotEndMinutes > currentEndMinutes) {
        currentEnd = slot.end
      }
    } else {
      // 現在の連続枠を確定して、新しい枠を開始
      const startMinutes = timeToMinutes(currentStart)
      const endMinutes = timeToMinutes(currentEnd)
      
      mergedSlots.push({
        start: currentStart,
        end: currentEnd,
        duration: formatDuration(startMinutes, endMinutes)
      })

      currentStart = slot.start
      currentEnd = slot.end
    }
  }

  // 最後の枠を追加
  const startMinutes = timeToMinutes(currentStart)
  const endMinutes = timeToMinutes(currentEnd)
  
  mergedSlots.push({
    start: currentStart,
    end: currentEnd,
    duration: formatDuration(startMinutes, endMinutes)
  })

  return mergedSlots
}

/**
 * マージされた時間枠を表示用文字列に変換
 */
export function formatMergedTimeSlot(slot: MergedTimeSlot): string {
  return `${slot.start} - ${slot.end} (${slot.duration})`
}

/**
 * 日単位の時間枠データをマージ
 */
export interface DaySlot {
  date: string
  times: string[]
}

export interface MergedDaySlot {
  date: string
  mergedTimes: MergedTimeSlot[]
  originalCount: number // 元の時間枠数
}

export function mergeDaySlots(daySlots: DaySlot[]): MergedDaySlot[] {
  return daySlots.map(daySlot => ({
    date: daySlot.date,
    mergedTimes: mergeConsecutiveTimeSlots(daySlot.times),
    originalCount: daySlot.times.length
  }))
}