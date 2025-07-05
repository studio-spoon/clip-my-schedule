'use client'

import { Users } from 'lucide-react'
import type { Member } from '@/types/api'

interface MemberSelectionProps {
  teamMembers: Member[]
  selectedMembers: string[]
  isLoading: boolean
  error: string | null
  onMemberToggle: (member: string) => void
  onRetry: () => void
}

export default function MemberSelection({
  teamMembers,
  selectedMembers,
  isLoading,
  error,
  onMemberToggle,
  onRetry
}: MemberSelectionProps) {
  return (
    <div className='mb-8'>
      <div className='flex items-center gap-3 mb-4'>
        <div className='p-2 bg-blue-100 dark:bg-blue-900 rounded-lg'>
          <Users className='w-5 h-5 text-blue-600 dark:text-blue-400' />
        </div>
        <h2 className='text-lg font-semibold text-gray-900 dark:text-white'>
          参加者を選択
        </h2>
        <span className='text-sm text-gray-500 dark:text-gray-400'>
          {isLoading ? '読み込み中...' : '組織メンバー・共有カレンダーから'}
        </span>
      </div>
      
      <div className='bg-gray-50 dark:bg-gray-700 rounded-xl p-4 border border-gray-200 dark:border-gray-600'>
        {error && (
          <div className='mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg'>
            <p className='text-sm text-yellow-800 dark:text-yellow-200'>
              ⚠️ {error}
            </p>
            <button 
              onClick={onRetry}
              className='mt-2 text-sm text-yellow-600 dark:text-yellow-400 hover:underline'
            >
              再試行
            </button>
          </div>
        )}
        
        <div className='space-y-3'>
          {isLoading ? (
            <div className='flex items-center gap-3 py-2'>
              <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600'></div>
              <span className='text-gray-600 dark:text-gray-400'>メンバーを読み込み中...</span>
            </div>
          ) : (
            teamMembers.map((member) => (
              <label
                key={member.email}
                className='flex items-center gap-3 cursor-pointer group'
              >
                <input
                  type='checkbox'
                  checked={selectedMembers.includes(member.displayName)}
                  onChange={() => onMemberToggle(member.displayName)}
                  className='w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600'
                />
                <span className='text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors'>
                  {member.displayName}
                  {member.source === 'self' && (
                    <span className='ml-2 text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 px-2 py-1 rounded'>
                      あなた
                    </span>
                  )}
                  {member.source === 'organization' && (
                    <span className='ml-2 text-xs bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 px-2 py-1 rounded'>
                      組織
                    </span>
                  )}
                  {member.source === 'shared' && (
                    <span className='ml-2 text-xs bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400 px-2 py-1 rounded'>
                      共有
                    </span>
                  )}
                </span>
              </label>
            ))
          )}
          
          {!isLoading && teamMembers.length === 0 && !error && (
            <p className='text-gray-500 dark:text-gray-400 text-sm py-2'>
              共有されているカレンダーが見つかりません
            </p>
          )}
        </div>
      </div>
    </div>
  )
}