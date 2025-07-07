'use client'

import { useState } from 'react'
import { Bug, ChevronDown } from 'lucide-react'
import { Member } from '@/types/api'

interface DebugPanelProps {
  teamMembers: Member[]
}

export default function DebugPanel({ teamMembers }: DebugPanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [diagnostics, setDiagnostics] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const runDiagnostics = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/members/diagnose')
      const data = await response.json()
      setDiagnostics(data.data)
    } catch (error) {
      console.error('Diagnostics failed:', error)
      setDiagnostics({ error: 'Failed to run diagnostics' })
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-full shadow-lg transition-colors"
          title="Open Debug Panel"
        >
          <Bug className="w-5 h-5" />
        </button>
      </div>
    )
  }

  const membersBySource = {
    self: teamMembers.filter(m => m.source === 'self'),
    organization: teamMembers.filter(m => m.source === 'organization'),
    shared: teamMembers.filter(m => m.source === 'shared')
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl max-w-md w-full max-h-96 overflow-y-auto">
      <div className="p-4 border-b border-gray-200 dark:border-gray-600 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Bug className="w-4 h-4" />
          Debug Panel
        </h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>
      
      <div className="p-4 space-y-4">
        <div>
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">Members Summary</h4>
          <div className="text-sm space-y-1">
            <div>Total: {teamMembers.length}</div>
            <div>Self: {membersBySource.self.length}</div>
            <div>Organization: {membersBySource.organization.length}</div>
            <div>Shared: {membersBySource.shared.length}</div>
          </div>
        </div>

        <div>
          <button
            onClick={runDiagnostics}
            disabled={isLoading}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white py-2 px-4 rounded text-sm"
          >
            {isLoading ? 'Running...' : 'Run Diagnostics'}
          </button>
        </div>

        {diagnostics && (
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Diagnostics</h4>
            <div className="text-xs space-y-2 bg-gray-50 dark:bg-gray-700 p-3 rounded">
              <div>Domain: {diagnostics.userDomain}</div>
              <div>
                Admin SDK: {diagnostics.tests?.adminSDK?.success ? '✅' : '❌'}
                {diagnostics.tests?.adminSDK?.error && (
                  <div className="text-red-500 ml-4">{diagnostics.tests.adminSDK.error}</div>
                )}
              </div>
              <div>
                People API: {diagnostics.tests?.peopleAPI?.success ? '✅' : '❌'}
                {diagnostics.tests?.peopleAPI?.connectionsFound !== undefined && (
                  <div className="ml-4">Contacts: {diagnostics.tests.peopleAPI.connectionsFound}</div>
                )}
              </div>
              <div>
                Calendar API: {diagnostics.tests?.calendarAPI?.success ? '✅' : '❌'}
              </div>
            </div>
          </div>
        )}

        {membersBySource.organization.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Organization Members</h4>
            <div className="text-xs space-y-1 max-h-32 overflow-y-auto">
              {membersBySource.organization.map((member, i) => (
                <div key={i} className="truncate">{member.displayName}</div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}