'use client';

import React, { useEffect, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useMembers } from '@/hooks/useMembers';
import { useScheduleState } from '@/hooks/useScheduleState';
import { useScheduleSearch } from '@/hooks/useScheduleSearch';
import { useUserSettings } from '@/hooks/useUserSettings';
import LoginForm from '@/components/LoginForm';
import AppHeader from '@/components/AppHeader';
import MemberSelection from '@/components/MemberSelection';
import ScheduleForm from '@/components/ScheduleForm';
import ScheduleResults from '@/components/ScheduleResults';
import DebugPanel from '@/components/DebugPanel';
import Footer from '@/components/Footer';
// 課金機能は開発中のため一時的にコメントアウト
// import PricingBanner from '@/components/PricingBanner';
import { Member } from '@/types/api';
// import { useFeatureFlags } from '@/hooks/useFeatureFlags';
// import { usePricing } from '@/hooks/usePricing';

function SchedulerContent() {
  // NextAuth.jsセッション管理
  const { data: session, status } = useSession();
  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated';

  // カスタムフック
  const {
    settings,
    addFavoriteMember,
    removeFavoriteMember,
    addSearchHistory,
  } = useUserSettings();
  const {
    teamMembers,
    isLoading: isMembersLoading,
    error: membersError,
    refetch: refetchMembers,
    addManualMember,
  } = useMembers();
  const scheduleState = useScheduleState(settings);
  const { availableSlots, isSearching, hasSearched, searchSchedule } =
    useScheduleSearch();
  // 課金機能は開発中のため一時的にコメントアウト
  // const featureFlags = useFeatureFlags();
  // const { updateUsage } = usePricing();

  // セッション初期化とお気に入りメンバー自動選択
  useEffect(() => {
    if (session?.user && teamMembers.length > 0) {
      // 自分を最初に選択状態にする（まだ選択されていない場合のみ）
      const currentUser = teamMembers.find(
        (member) => member.email === session?.user?.email
      );
      if (
        currentUser &&
        !scheduleState.selectedMembers.includes(currentUser.displayName)
      ) {
        scheduleState.handleMemberToggle(currentUser.displayName);
      }

      // お気に入りメンバーを自動選択
      if (settings.favoriteMembers && settings.favoriteMembers.length > 0) {
        const favoriteEmails = settings.favoriteMembers.map((fav) => fav.email);
        const favoriteTeamMembers = teamMembers.filter((member) =>
          favoriteEmails.includes(member.email)
        );

        favoriteTeamMembers.forEach((member) => {
          if (!scheduleState.selectedMembers.includes(member.displayName)) {
            scheduleState.handleMemberToggle(member.displayName);
          }
        });
      }
    }
  }, [
    session,
    teamMembers,
    scheduleState.selectedMembers,
    scheduleState.handleMemberToggle,
    settings.favoriteMembers,
  ]);

  // ログアウト
  const handleLogout = () => {
    scheduleState.clearAll();
    signOut();
  };

  const handleSearch = (forceRefresh = false) => {
    // 課金機能は開発中のため制限チェックを一時的にコメントアウト
    // if (!featureFlags.canPerformSearch) {
    //   console.warn('Search limit reached');
    //   return;
    // }

    // 使用量を更新
    // updateUsage('search');

    // 検索履歴を記録
    addSearchHistory({
      participants: scheduleState.selectedMembers,
      timeSlot: scheduleState.selectedTimeSlot,
      customTimeStart: scheduleState.customTimeStart,
      customTimeEnd: scheduleState.customTimeEnd,
      meetingDuration: scheduleState.meetingDuration,
      bufferTimeBefore: scheduleState.bufferTimeBefore,
      bufferTimeAfter: scheduleState.bufferTimeAfter,
    });

    searchSchedule({
      ...scheduleState.scheduleState,
      teamMembers,
      forceRefresh,
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

    // 検索条件が変わったときだけ検索（自動検索が有効の場合のみ）
    if (
      hasSearched &&
      settings.autoSearch &&
      JSON.stringify(prevSearchParams.current) !== JSON.stringify(currentParams)
    ) {
      prevSearchParams.current = currentParams;
      handleSearch(false); // 自動検索時はキャッシュを使用
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
    settings.autoSearch,
  ]);

  const handleAddMember = async (member: Member) => {
    // 課金機能は開発中のため制限チェックを一時的にコメントアウト
    // if (!featureFlags.canAddNewMember) {
    //   console.warn('Member limit reached');
    //   return;
    // }

    // 新しいメンバーをローカルに追加
    if (member.email) {
      await addManualMember(member.email);
      // 使用量を更新
      // updateUsage('member');
    }
  };

  // ローディング画面
  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center' style={{background: 'var(--gradient-background)'}}>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
          <p style={{color: 'var(--muted-foreground)'}}>読み込み中...</p>
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
      <div className='min-h-screen transition-colors duration-200' style={{background: 'var(--gradient-background)'}}>
        <div className='p-4 lg:p-8'>
          <div className='max-w-6xl mx-auto'>
            <AppHeader session={session} onLogout={handleLogout} />

            {/* プライシングバナー - 開発中のため非表示 */}
            {/* <PricingBanner /> */}

            {/* メインコンテンツ */}
            <div
              className='rounded-2xl p-4 md:p-8 backdrop-blur-sm'
              style={{
                backgroundColor: 'var(--card)',
                border: `1px solid var(--border)`,
                boxShadow: 'var(--shadow-xl)'
              }}
            >
              <MemberSelection
                teamMembers={teamMembers}
                selectedMembers={scheduleState.selectedMembers}
                isLoading={isMembersLoading}
                error={membersError}
                onMemberToggle={scheduleState.handleMemberToggle}
                onRetry={refetchMembers}
                onAddMember={handleAddMember}
                userEmail={session?.user?.email || null}
                favoriteMembers={settings.favoriteMembers}
                onAddFavorite={addFavoriteMember}
                onRemoveFavorite={removeFavoriteMember}
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
                userSettings={settings}
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
                userSettings={settings}
              />
            </div>
          </div>

          {/* フッター */}
          <Footer />
        </div>
      </div>

      {/* Debug Panel (ユーザー設定に基づいて表示) */}
      {settings.showDebugInfo && <DebugPanel teamMembers={teamMembers} />}
    </div>
  );
}

export default function Scheduler() {
  return (
    <div className="dark-theme">
      <SchedulerContent />
    </div>
  );
}
