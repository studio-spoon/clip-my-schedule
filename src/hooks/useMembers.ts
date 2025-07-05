'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

export interface Member {
  email: string
  name: string
  displayName: string
  calendarId: string
  accessRole: string
  source: 'self' | 'shared' | 'organization'
}

export function useMembers() {
  const { data: session } = useSession()
  const [teamMembers, setTeamMembers] = useState<Member[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchMembers = async () => {
    if (!session?.user) return

    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/members')
      
      if (!response.ok) {
        throw new Error('メンバー情報の取得に失敗しました')
      }

      const data = await response.json()
      
      if (data.success) {
        setTeamMembers(data.data.members)
      } else {
        throw new Error(data.error || 'メンバー情報の取得に失敗しました')
      }
    } catch (error) {
      console.error('Members fetch error:', error)
      setError(error instanceof Error ? error.message : '不明なエラー')
      
      // フォールバック: 自分のみ
      const fallbackMembers: Member[] = [
        {
          email: session?.user?.email || 'user@example.com',
          name: session?.user?.name || 'あなた',
          displayName: `${session?.user?.name || 'あなた'} (${session?.user?.email || 'user@example.com'})`,
          calendarId: session?.user?.email || 'user@example.com',
          accessRole: 'owner',
          source: 'self'
        }
      ]
      setTeamMembers(fallbackMembers)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (session?.user) {
      fetchMembers()
    }
  }, [session])

  const refetch = () => {
    fetchMembers()
  }

  return {
    teamMembers,
    isLoading,
    error,
    refetch
  }
}