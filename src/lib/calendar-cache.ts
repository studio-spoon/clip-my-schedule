// Calendar data caching for efficiency
interface CachedCalendarData {
  email: string
  timeMin: string
  timeMax: string
  busyPeriods: Array<{ start: string; end: string }>
  cachedAt: number
  expiresAt: number
}

// In-memory cache (in production, use Redis or similar)
const calendarCache = new Map<string, CachedCalendarData>()

// Cache duration: 5 minutes
const CACHE_DURATION = 5 * 60 * 1000

export function getCacheKey(email: string, timeMin: string, timeMax: string): string {
  return `${email}:${timeMin}:${timeMax}`
}

export function getCachedCalendarData(email: string, timeMin: string, timeMax: string): CachedCalendarData | null {
  const key = getCacheKey(email, timeMin, timeMax)
  const cached = calendarCache.get(key)
  
  if (!cached) {
    return null
  }
  
  if (Date.now() > cached.expiresAt) {
    calendarCache.delete(key)
    return null
  }
  
  return cached
}

export function setCachedCalendarData(
  email: string, 
  timeMin: string, 
  timeMax: string, 
  busyPeriods: Array<{ start: string; end: string }>
): void {
  const key = getCacheKey(email, timeMin, timeMax)
  const now = Date.now()
  
  const cachedData: CachedCalendarData = {
    email,
    timeMin,
    timeMax,
    busyPeriods,
    cachedAt: now,
    expiresAt: now + CACHE_DURATION
  }
  
  calendarCache.set(key, cachedData)
}

export function clearCalendarCache(email?: string): void {
  if (email) {
    // Clear all cache entries for specific email
    const keysToDelete = Array.from(calendarCache.keys()).filter(key => key.startsWith(email + ':'))
    keysToDelete.forEach(key => calendarCache.delete(key))
  } else {
    // Clear all cache
    const size = calendarCache.size
    calendarCache.clear()
  }
}

export function clearCalendarCacheForEmails(emails: string[]): void {
  let totalCleared = 0
  emails.forEach(email => {
    const keysToDelete = Array.from(calendarCache.keys()).filter(key => key.startsWith(email + ':'))
    keysToDelete.forEach(key => calendarCache.delete(key))
    totalCleared += keysToDelete.length
  })
}

export function getCacheStats(): {
  totalEntries: number
  activeEntries: number
  expiredEntries: number
  cacheSize: string
} {
  const now = Date.now()
  const entries = Array.from(calendarCache.values())
  
  const activeEntries = entries.filter(entry => entry.expiresAt > now).length
  const expiredEntries = entries.filter(entry => entry.expiresAt <= now).length
  
  // Clean up expired entries
  if (expiredEntries > 0) {
    Array.from(calendarCache.entries())
      .filter(([_, entry]) => entry.expiresAt <= now)
      .forEach(([key, _]) => calendarCache.delete(key))
  }
  
  return {
    totalEntries: calendarCache.size,
    activeEntries,
    expiredEntries,
    cacheSize: `${JSON.stringify(Object.fromEntries(calendarCache)).length} bytes`
  }
}