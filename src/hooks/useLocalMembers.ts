'use client'

import { useState, useEffect } from 'react'
import type { Member } from '@/types/api'

const LOCAL_MEMBERS_KEY = 'clip-my-schedule-local-members'

export function useLocalMembers(userEmail?: string | null) {
  const [localMembers, setLocalMembers] = useState<Member[]>([])

  // ユーザーごとにローカルメンバーを管理
  const getStorageKey = () => {
    return userEmail ? `${LOCAL_MEMBERS_KEY}-${userEmail}` : LOCAL_MEMBERS_KEY
  }

  useEffect(() => {
    if (typeof window !== 'undefined' && userEmail) {
      try {
        const stored = localStorage.getItem(getStorageKey())
        if (stored) {
          const parsed = JSON.parse(stored)
          setLocalMembers(Array.isArray(parsed) ? parsed : [])
        }
      } catch (error) {
        console.error('Failed to load local members:', error)
        setLocalMembers([])
      }
    }
  }, [userEmail])

  const addLocalMember = (member: Member) => {
    try {
      const updated = [...localMembers, member]
      setLocalMembers(updated)
      if (typeof window !== 'undefined') {
        localStorage.setItem(getStorageKey(), JSON.stringify(updated))
      }
    } catch (error) {
      console.error('Failed to save local member:', error)
    }
  }

  const removeLocalMember = (email: string) => {
    try {
      const updated = localMembers.filter(m => m.email !== email)
      setLocalMembers(updated)
      if (typeof window !== 'undefined') {
        localStorage.setItem(getStorageKey(), JSON.stringify(updated))
      }
    } catch (error) {
      console.error('Failed to remove local member:', error)
    }
  }

  const clearLocalMembers = () => {
    try {
      setLocalMembers([])
      if (typeof window !== 'undefined') {
        localStorage.removeItem(getStorageKey())
      }
    } catch (error) {
      console.error('Failed to clear local members:', error)
    }
  }

  return {
    localMembers,
    addLocalMember,
    removeLocalMember,
    clearLocalMembers
  }
}