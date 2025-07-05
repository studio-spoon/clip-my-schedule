'use client';

import React, { useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useMembers } from '@/hooks/useMembers';
import { useScheduleState } from '@/hooks/useScheduleState';
import { useScheduleSearch } from '@/hooks/useScheduleSearch';
import LoginForm from '@/components/LoginForm';
import AppHeader from '@/components/AppHeader';
import MemberSelection from '@/components/MemberSelection';
import ScheduleForm from '@/components/ScheduleForm';
import ScheduleResults from '@/components/ScheduleResults';
import DebugPanel from '@/components/DebugPanel';

function SchedulerContent() {
  // NextAuth.jsセッション管理
  const { data: session, status } = useSession();
  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated';

  // カスタムフック
  const { teamMembers, isLoading: isMembersLoading, error: membersError, refetch: refetchMembers, addManualMember } = useMembers();
  const scheduleState = useScheduleState();
  const { availableSlots, isSearching, hasSearched, searchSchedule } = useScheduleSearch();

  // セッション初期化
  useEffect(() => {
    if (session?.user && teamMembers.length > 0 && scheduleState.selectedMembers.length === 0) {
      // 自分を最初に選択状態にする
      const currentUser = teamMembers.find((member) => 
        member.email === session?.user?.email
      );
      if (currentUser) {
        scheduleState.setInitialMember(currentUser.displayName);
      }
    }
  }, [session, teamMembers, scheduleState]);


  // ログアウト
  const handleLogout = () => {
    scheduleState.clearAll();
    signOut();
  };

  const handleSearch = () => {
    searchSchedule({
      selectedMembers: scheduleState.selectedMembers,
      selectedPeriod: scheduleState.selectedPeriod,
      teamMembers
    });
  };

  // 設定変更時の自動再検索
  useEffect(() => {
    if (hasSearched && scheduleState.selectedMembers.length > 0) {
      const timeoutId = setTimeout(() => {
        handleSearch();
      }, 500); // 500ms の debounce

      return () => clearTimeout(timeoutId);
    }
  }, [
    scheduleState.selectedMembers,
    scheduleState.selectedPeriod,
    scheduleState.selectedTimeSlot,
    scheduleState.customTimeStart,
    scheduleState.customTimeEnd,
    scheduleState.meetingDuration,
    scheduleState.bufferTime,
    scheduleState.customDuration,
    hasSearched
  ]);

  const handleAddMember = async (member: any) => {
    // 新しいメンバーをローカルに追加
    if (member.email) {
      await addManualMember(member.email);
    }
  };


  // ローディング画面
  if (isLoading) {
    return (
      <div
        className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center"
      >
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
          <p className='text-gray-600 dark:text-gray-400'>読み込み中...</p>
        </div>
      </div>
    );
  }

  // ログイン画面
  if (!isAuthenticated) {
    return <LoginForm isLoading={isLoading} />;
  }

  // メインアプリケーション（ログイン後）
  return (
    <div
      className="min-h-screen transition-colors duration-200"
    >
      <div className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-200'>
        <div className='p-4 lg:p-8'>
          <div className='max-w-6xl mx-auto'>
            <AppHeader session={session} onLogout={handleLogout} />

            {/* メインコンテンツ */}
            <div className='bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8 backdrop-blur-sm'>
              <MemberSelection
                teamMembers={teamMembers}
                selectedMembers={scheduleState.selectedMembers}
                isLoading={isMembersLoading}
                error={membersError}
                onMemberToggle={scheduleState.handleMemberToggle}
                onRetry={refetchMembers}
                onAddMember={handleAddMember}
                userEmail={session?.user?.email || null}
              />
              
              <ScheduleForm
                selectedPeriod={scheduleState.selectedPeriod}
                selectedTimeSlot={scheduleState.selectedTimeSlot}
                customTimeStart={scheduleState.customTimeStart}
                customTimeEnd={scheduleState.customTimeEnd}
                meetingDuration={scheduleState.meetingDuration}
                bufferTime={scheduleState.bufferTime}
                customDuration={scheduleState.customDuration}
                isSearching={isSearching}
                hasSearched={hasSearched}
                onPeriodChange={scheduleState.setSelectedPeriod}
                onTimeSlotChange={scheduleState.setSelectedTimeSlot}
                onCustomTimeStartChange={scheduleState.setCustomTimeStart}
                onCustomTimeEndChange={scheduleState.setCustomTimeEnd}
                onMeetingDurationChange={scheduleState.setMeetingDuration}
                onBufferTimeChange={scheduleState.setBufferTime}
                onCustomDurationChange={scheduleState.setCustomDuration}
                onSearch={handleSearch}
              />
              
              <ScheduleResults
                availableSlots={availableSlots}
                selectedMembers={scheduleState.selectedMembers}
                selectedPeriod={scheduleState.selectedPeriod}
                selectedTimeSlot={scheduleState.selectedTimeSlot}
                customTimeStart={scheduleState.customTimeStart}
                customTimeEnd={scheduleState.customTimeEnd}
                meetingDuration={scheduleState.meetingDuration}
                bufferTime={scheduleState.bufferTime}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Debug Panel (開発環境のみ) */}
      {process.env.NODE_ENV === 'development' && (
        <DebugPanel teamMembers={teamMembers} />
      )}
    </div>
  );
}

export default SchedulerContent;
