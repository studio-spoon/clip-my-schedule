'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { api } from '@/services/api'
import { useLocalMembers } from '@/hooks/useLocalMembers'
import type { Member } from '@/types/api'

export function useMembers() {
  const { data: session } = useSession()
  const [apiMembers, setApiMembers] = useState<Member[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { localMembers, addLocalMember } = useLocalMembers(session?.user?.email)
  
  // APIメンバーとローカルメンバーを統合
  const teamMembers = [...apiMembers, ...localMembers.filter(local => 
    !apiMembers.some(api => api.email === local.email)
  )]

  const fetchMembers = async () => {
    if (!session?.user) return

    setIsLoading(true)
    setError(null)
    
    try {
      const result = await api.members.getMembers()
      
      if (result.success && result.data) {
        console.log('✅ Members loaded successfully:', {
          total: result.data.members.length,
          bySource: {
            self: result.data.members.filter(m => m.source === 'self').length,
            organization: result.data.members.filter(m => m.source === 'organization').length,
            shared: result.data.members.filter(m => m.source === 'shared').length
          }
        })
        setApiMembers(result.data.members)
      } else {
        throw new Error(result.error || 'メンバー情報の取得に失敗しました')
      }
    } catch (error) {
      console.error('❌ Members fetch error:', error)
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
      setApiMembers(fallbackMembers)
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

  const addManualMember = async (email: string) => {
    // まずローカルに追加
    const tempMember: Member = {
      email,
      name: email.split('@')[0],
      displayName: `${email.split('@')[0]} (${email})`,
      calendarId: email,
      accessRole: 'organization',
      source: 'organization'
    }
    
    addLocalMember(tempMember)
    
    // APIで検証を試行（オプション）
    try {
      const result = await api.members.addMember(email)
      if (result.success && result.data) {
        console.log('✅ Member verified via API:', result.data.member)
      }
    } catch (error) {
      console.warn('Member verification failed, but kept in local storage:', error)
    }
  }

  return {
    teamMembers,
    isLoading,
    error,
    refetch,
    addManualMember
  }
}