'use client';

import { Users, Search, X, Star } from 'lucide-react';
import { useState, useMemo } from 'react';
import type { Member } from '@/types/api';
import type { FavoriteMember } from '@/types/settings';
import AddMemberForm from '@/components/AddMemberForm';
import UserAvatar from '@/components/UserAvatar';
import { useAvailableSlots } from '@/hooks/useAvailableSlots';

interface MemberSelectionProps {
  teamMembers: Member[];
  selectedMembers: string[];
  isLoading: boolean;
  error: string | null;
  onMemberToggle: (member: string) => void;
  onRetry: () => void;
  onAddMember?: (member: Member) => void;
  userEmail?: string | null;
  favoriteMembers?: FavoriteMember[];
  onAddFavorite?: (member: FavoriteMember) => void;
  onRemoveFavorite?: (email: string) => void;
}

export default function MemberSelection({
  teamMembers,
  selectedMembers,
  isLoading,
  error,
  onMemberToggle,
  onRetry,
  onAddMember,
  userEmail,
  favoriteMembers = [],
  onAddFavorite,
  onRemoveFavorite,
}: MemberSelectionProps) {
  const [addMemberError, setAddMemberError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  const userDomain = userEmail?.split('@')[1] || '';
  const organizationMembers = teamMembers.filter(
    (m) => m.source === 'organization'
  );

  // お気に入りメンバーの管理
  const isFavorite = (email: string) => {
    return favoriteMembers.some(fav => fav.email === email);
  };

  const handleToggleFavorite = (member: Member) => {
    if (isFavorite(member.email)) {
      onRemoveFavorite?.(member.email);
    } else {
      onAddFavorite?.({
        email: member.email,
        name: member.name,
        addedAt: new Date().toISOString(),
      });
    }
  };

  // 選択されたメンバーの空き時間を取得
  const {} = useAvailableSlots(selectedMembers, teamMembers);

  // 検索フィルタリング
  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    const query = searchQuery.toLowerCase();
    return teamMembers.filter(member => 
      member.name.toLowerCase().includes(query) ||
      member.email.toLowerCase().includes(query) ||
      member.displayName.toLowerCase().includes(query)
    );
  }, [teamMembers, searchQuery]);

  // 選択済みメンバーの詳細情報を取得
  const selectedMemberDetails = useMemo(() => {
    return selectedMembers.map(memberName => 
      teamMembers.find(m => m.displayName === memberName)
    ).filter(Boolean) as Member[];
  }, [selectedMembers, teamMembers]);

  // 自分とそれ以外を分ける
  const selfMember = selectedMemberDetails.find(m => m.source === 'self');
  const otherSelectedMembers = selectedMemberDetails.filter(m => m.source !== 'self');

  const handleSearchFocus = () => {
    setShowSearchResults(true);
  };

  const handleSearchBlur = () => {
    // 少し遅延させてクリックイベントを処理できるようにする
    setTimeout(() => setShowSearchResults(false), 200);
  };

  const handleMemberSelect = (member: Member) => {
    onMemberToggle(member.displayName);
    setSearchQuery('');
    setShowSearchResults(false);
  };

  const handleRemoveMember = (memberName: string) => {
    onMemberToggle(memberName);
  };

  const handleAddMember = async (email: string) => {
    setAddMemberError(null);

    try {
      // 簡単なメンバー情報を作成
      const member = {
        email,
        name: email.split('@')[0],
        displayName: `${email.split('@')[0]} (${email})`,
        calendarId: email,
        accessRole: 'organization',
        source: 'organization' as const,
      };

      if (onAddMember) {
        onAddMember(member);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : '不明なエラー';
      setAddMemberError(errorMessage);
      throw error;
    }
  };
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
          {isLoading ? '読み込み中...' : `${teamMembers.length}名から選択可能`}
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

        {/* 選択済みメンバー表示 */}
        {selectedMemberDetails.length > 0 && (
          <div className='mb-4'>
            <div className='text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
              選択済み ({selectedMemberDetails.length}名)
            </div>
            <div className='flex flex-wrap gap-2'>
              {/* 自分を最初に表示 */}
              {selfMember && (
                <div className='flex items-center gap-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-lg text-sm'>
                  <UserAvatar 
                    name={selfMember.name}
                    email={selfMember.email}
                    photo={selfMember.photo}
                    source={selfMember.source}
                    size="sm"
                  />
                  <span>{selfMember.name}</span>
                  <span className='text-xs bg-blue-200 dark:bg-blue-800 px-1 rounded'>あなた</span>
                </div>
              )}
              {/* その他のメンバー */}
              {otherSelectedMembers.map((member) => (
                <div
                  key={member.email}
                  className='flex items-center gap-2 bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-3 py-1 rounded-lg text-sm'
                >
                  <UserAvatar 
                    name={member.name}
                    email={member.email}
                    photo={member.photo}
                    source={member.source}
                    size="sm"
                  />
                  <span>{member.name}</span>
                  <span className={`text-xs px-1 rounded ${
                    member.source === 'organization' 
                      ? 'bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200'
                      : 'bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200'
                  }`}>
                    {member.source === 'organization' ? '組織' : '共有'}
                  </span>
                  <button
                    onClick={() => handleToggleFavorite(member)}
                    className={`${
                      isFavorite(member.email)
                        ? 'text-yellow-500 hover:text-yellow-600'
                        : 'text-gray-400 hover:text-yellow-500'
                    } transition-colors`}
                    title={isFavorite(member.email) ? 'お気に入りから削除' : 'お気に入りに追加'}
                  >
                    {isFavorite(member.email) ? <Star className='w-3 h-3 fill-current' /> : <Star className='w-3 h-3' />}
                  </button>
                  <button
                    onClick={() => handleRemoveMember(member.displayName)}
                    className='text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400'
                    title='削除'
                  >
                    <X className='w-3 h-3' />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 検索バー */}
        {!isLoading && teamMembers.length > 0 && (
          <div className='mb-4 relative'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
              <input
                type='text'
                placeholder='名前やメールアドレスで検索...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={handleSearchFocus}
                onBlur={handleSearchBlur}
                className='w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              />
            </div>

            {/* 検索結果ドロップダウン */}
            {showSearchResults && searchQuery.trim() && (
              <div className='absolute top-full left-0 right-0 z-10 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto'>
                {filteredMembers.length > 0 ? (
                  <div className='py-1'>
                    {filteredMembers.map((member) => {
                      const isSelected = selectedMembers.includes(member.displayName);
                      return (
                        <button
                          key={member.email}
                          onClick={() => handleMemberSelect(member)}
                          disabled={isSelected}
                          className={`w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 ${
                            isSelected 
                              ? 'bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed' 
                              : 'text-gray-900 dark:text-white'
                          }`}
                        >
                          <UserAvatar 
                            name={member.name}
                            email={member.email}
                            photo={member.photo}
                            source={member.source}
                            size="md"
                          />
                          <div className='flex-1'>
                            <div className='font-medium'>{member.name}</div>
                            <div className='text-sm text-gray-500 dark:text-gray-400'>{member.email}</div>
                          </div>
                          <div className='flex gap-1'>
                            {member.source === 'self' && (
                              <span className='text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 px-2 py-1 rounded'>
                                あなた
                              </span>
                            )}
                            {member.source === 'organization' && (
                              <span className='text-xs bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 px-2 py-1 rounded'>
                                組織
                              </span>
                            )}
                            {member.source === 'shared' && (
                              <span className='text-xs bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400 px-2 py-1 rounded'>
                                共有
                              </span>
                            )}
                            {isSelected && (
                              <span className='text-xs bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400 px-2 py-1 rounded'>
                                選択済み
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className='px-4 py-3 text-gray-500 dark:text-gray-400 text-sm'>
                    該当するメンバーが見つかりません
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 組織メンバーが少ない場合の手動追加機能 */}
        {userDomain &&
          organizationMembers.length === 0 &&
          !isLoading &&
          onAddMember && (
            <div className='mb-4'>
              <div className='bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4'>
                <p className='text-sm text-blue-800 dark:text-blue-200 mb-3'>
                  💡 組織メンバーが自動検出されませんでした。手動で追加できます。
                </p>
                <AddMemberForm
                  onAddMember={handleAddMember}
                  userDomain={userDomain}
                />
                {addMemberError && (
                  <div className='mt-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-800 dark:text-red-200'>
                    ❌ {addMemberError}
                  </div>
                )}
              </div>
            </div>
          )}

        {/* ローディング状態 */}
        {isLoading && (
          <div className='flex items-center gap-3 py-4'>
            <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600'></div>
            <span className='text-gray-600 dark:text-gray-400'>
              メンバーを読み込み中...
            </span>
          </div>
        )}

        {/* メンバーが見つからない場合 */}
        {!isLoading && teamMembers.length === 0 && !error && (
          <div className='text-center py-8'>
            <Users className='w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-3' />
            <p className='text-gray-500 dark:text-gray-400 text-sm'>
              利用可能なメンバーが見つかりません
            </p>
          </div>
        )}

        {/* 統計情報 */}
        {!isLoading && teamMembers.length > 0 && (
          <div className='mt-4 pt-3 border-t border-gray-200 dark:border-gray-600'>
            <div className='flex gap-4 text-xs text-gray-500 dark:text-gray-400'>
              <span>組織: {organizationMembers.length}名</span>
              <span>共有: {teamMembers.filter(m => m.source === 'shared').length}名</span>
              <span>合計: {teamMembers.length}名</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
