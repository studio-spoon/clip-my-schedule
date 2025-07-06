'use client';

import React, { useEffect, useRef } from 'react';
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
import { Member } from '@/types/api';

function SchedulerContent() {
  // NextAuth.jsセッション管理
  const { data: session, status } = useSession();
  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated';

  // カスタムフック
  const {
    teamMembers,
    isLoading: isMembersLoading,
    error: membersError,
    refetch: refetchMembers,
    addManualMember,
  } = useMembers();
  const scheduleState = useScheduleState();
  const { availableSlots, isSearching, hasSearched, searchSchedule } =
    useScheduleSearch();

  // セッション初期化
  useEffect(() => {
    if (
      session?.user &&
      teamMembers.length > 0 &&
      scheduleState.selectedMembers.length === 0
    ) {
      // 自分を最初に選択状態にする
      const currentUser = teamMembers.find(
        (member) => member.email === session?.user?.email
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
    // 🔍 Scheduler component - パラメータをログ出力して確認
    console.log('🎯 Scheduler.handleSearch called with state:');
    console.log('   selectedMembers:', scheduleState.selectedMembers);
    console.log('   selectedPeriod:', scheduleState.selectedPeriod);
    console.log('   selectedTimeSlot:', scheduleState.selectedTimeSlot);
    console.log('   customTimeStart:', scheduleState.customTimeStart);
    console.log('   customTimeEnd:', scheduleState.customTimeEnd);
    console.log('   meetingDuration:', scheduleState.meetingDuration);
    console.log('   bufferTimeBefore:', scheduleState.bufferTimeBefore);
    console.log('   bufferTimeAfter:', scheduleState.bufferTimeAfter);
    console.log('   customDuration:', scheduleState.customDuration);
    console.log('   customPeriodStart:', scheduleState.customPeriodStart);
    console.log('   customPeriodEnd:', scheduleState.customPeriodEnd);
    console.log('   teamMembers count:', teamMembers.length);

    searchSchedule({
      ...scheduleState.scheduleState,
      teamMembers,
    });
  };

  // 設定変更時の自動再検索
  const prevSearchParams = useRef<any>(null);

  useEffect(() => {
    const currentParams = {
      selectedMembers: scheduleState.selectedMembers,
      selectedPeriod: scheduleState.selectedPeriod,
      selectedTimeSlot: scheduleState.selectedTimeSlot,
      customTimeStart: scheduleState.customTimeStart,
      customTimeEnd: scheduleState.customTimeEnd,
      meetingDuration: scheduleState.meetingDuration,
      bufferTimeBefore: scheduleState.bufferTimeBefore,
      bufferTimeAfter: scheduleState.bufferTimeAfter,
      customDuration: scheduleState.customDuration,
      customPeriodStart: scheduleState.customPeriodStart,
      customPeriodEnd: scheduleState.customPeriodEnd,
    };

    // 検索条件が変わったときだけ検索
    if (
      hasSearched &&
      JSON.stringify(prevSearchParams.current) !== JSON.stringify(currentParams)
    ) {
      prevSearchParams.current = currentParams;
      handleSearch();
    }
  }, [
    scheduleState.selectedMembers,
    scheduleState.selectedPeriod,
    scheduleState.selectedTimeSlot,
    scheduleState.customTimeStart,
    scheduleState.customTimeEnd,
    scheduleState.meetingDuration,
    scheduleState.bufferTimeBefore,
    scheduleState.bufferTimeAfter,
    scheduleState.customDuration,
    scheduleState.customPeriodStart,
    scheduleState.customPeriodEnd,
    hasSearched,
    handleSearch,
  ]);

  const handleAddMember = async (member: Member) => {
    // 新しいメンバーをローカルに追加
    if (member.email) {
      await addManualMember(member.email);
    }
  };

  // ローディング画面
  if (isLoading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center'>
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
    <div className='min-h-screen transition-colors duration-200'>
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
                bufferTimeBefore={scheduleState.bufferTimeBefore}
                bufferTimeAfter={scheduleState.bufferTimeAfter}
                customDuration={scheduleState.customDuration}
                customPeriodStart={scheduleState.customPeriodStart}
                customPeriodEnd={scheduleState.customPeriodEnd}
                isSearching={isSearching}
                hasSearched={hasSearched}
                onPeriodChange={scheduleState.setSelectedPeriod}
                onTimeSlotChange={scheduleState.setSelectedTimeSlot}
                onCustomTimeStartChange={scheduleState.setCustomTimeStart}
                onCustomTimeEndChange={scheduleState.setCustomTimeEnd}
                onMeetingDurationChange={scheduleState.setMeetingDuration}
                onBufferTimeBeforeChange={scheduleState.setBufferTimeBefore}
                onBufferTimeAfterChange={scheduleState.setBufferTimeAfter}
                onCustomDurationChange={scheduleState.setCustomDuration}
                onCustomPeriodStartChange={scheduleState.setCustomPeriodStart}
                onCustomPeriodEndChange={scheduleState.setCustomPeriodEnd}
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
                bufferTimeAfter={scheduleState.bufferTimeAfter}
                bufferTimeBefore={scheduleState.bufferTimeBefore}
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
