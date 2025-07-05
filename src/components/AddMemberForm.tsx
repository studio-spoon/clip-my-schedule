'use client'

import { useState } from 'react'
import { Plus, X, UserPlus } from 'lucide-react'

interface AddMemberFormProps {
  onAddMember: (email: string) => void
  userDomain: string
}

export default function AddMemberForm({ onAddMember, userDomain }: AddMemberFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim()) return
    
    setIsAdding(true)
    try {
      await onAddMember(email.trim())
      setEmail('')
      setIsOpen(false)
    } catch (error) {
      console.error('Failed to add member:', error)
    } finally {
      setIsAdding(false)
    }
  }

  const handleEmailChange = (value: string) => {
    setEmail(value)
    // 同じドメインのメールアドレスを自動補完
    if (value && !value.includes('@')) {
      setEmail(value + '@' + userDomain)
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
      >
        <UserPlus className="w-4 h-4" />
        組織メンバーを追加
      </button>
    )
  }

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-blue-900 dark:text-blue-100">
          組織メンバーを追加
        </h4>
        <button
          onClick={() => {
            setIsOpen(false)
            setEmail('')
          }}
          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
            メールアドレス
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => handleEmailChange(e.target.value)}
            placeholder={`例: user@${userDomain}`}
            className="w-full px-3 py-2 border border-blue-300 dark:border-blue-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
            disabled={isAdding}
          />
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
            同じ組織（@{userDomain}）のメンバーのメールアドレスを入力してください
          </p>
        </div>
        
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isAdding || !email.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isAdding ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Plus className="w-4 h-4" />
            )}
            追加
          </button>
          <button
            type="button"
            onClick={() => {
              setIsOpen(false)
              setEmail('')
            }}
            className="px-4 py-2 text-blue-600 dark:text-blue-400 text-sm border border-blue-300 dark:border-blue-600 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30"
          >
            キャンセル
          </button>
        </div>
      </form>
    </div>
  )
}