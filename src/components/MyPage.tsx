'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Settings, Save, RotateCcw, Download, Upload, History, Star, Clock, Sun, Moon, Laptop, ArrowLeft } from 'lucide-react';
import { useUserSettings } from '@/hooks/useUserSettings';
import { useThemeContext } from '@/contexts/ThemeProvider';
import UserAvatar from '@/components/UserAvatar';

export default function MyPage() {
  const { data: session } = useSession();
  const {
    settings,
    isLoading,
    error,
    updateSetting,
    removeFavoriteMember,
    removeSearchHistory,
    clearSearchHistory,
    resetSettings,
    exportSettings,
    importSettings,
  } = useUserSettings();
  
  const { themeMode, setThemeMode, systemTheme } = useThemeContext();
  
  // Sync themeMode with userSettings on mount
  React.useEffect(() => {
    if (settings.theme && settings.theme !== themeMode) {
      setThemeMode(settings.theme);
    }
  }, [settings.theme, themeMode, setThemeMode]);

  const [activeTab, setActiveTab] = useState<'general' | 'favorites' | 'history'>('general');
  const [importError, setImportError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setImportError(null);
      await importSettings(file);
      alert('設定をインポートしました');
    } catch (err) {
      setImportError(err instanceof Error ? err.message : '設定のインポートに失敗しました');
    }
    
    // ファイル入力をリセット
    event.target.value = '';
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    // 保存アニメーション用の遅延
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">設定を読み込み中...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-3 sm:p-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-4 sm:mb-8">
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="p-2 sm:p-3 bg-blue-100 dark:bg-blue-900 rounded-xl">
            <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">マイページ</h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 hidden sm:block">
              あなたの設定と使用履歴を管理
            </p>
          </div>
        </div>
        
        {/* 戻るボタン */}
        <Link
          href="/app"
          className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm sm:text-base"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">アプリに戻る</span>
          <span className="sm:hidden">戻る</span>
        </Link>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-800 dark:text-red-200">❌ {error}</p>
        </div>
      )}

      {/* ユーザー情報 */}
      {session && (
        <div className="mb-4 sm:mb-8 p-3 sm:p-6 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 sm:gap-4">
            <UserAvatar
              name={session.user?.name || 'ユーザー'}
              email={session.user?.email || ''}
              photo={session.user?.image || undefined}
              source="self"
              size="lg"
            />
            <div className="min-w-0 flex-1">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate">
                {session.user?.name || 'ユーザー'}
              </h2>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 truncate">{session.user?.email}</p>
              <div className="mt-1 sm:mt-2 flex gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                <span>お気に入り: {settings.favoriteMembers.length}名</span>
                <span>•</span>
                <span>検索履歴: {settings.searchHistory.length}件</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* タブナビゲーション */}
      <div className="mb-4 sm:mb-6 border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-4 sm:space-x-8 overflow-x-auto">
          {[
            { id: 'general', label: '基本設定', icon: Settings },
            { id: 'favorites', label: 'お気に入り', icon: Star },
            { id: 'history', label: '履歴', icon: History },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center gap-1 sm:gap-2 py-2 sm:py-3 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                activeTab === id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{label}</span>
              <span className="sm:hidden">{label.replace('基本', '').replace('お気に入り', '★').replace('履歴', '履')}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* タブコンテンツ */}
      <div className="space-y-4 sm:space-y-6">
        {activeTab === 'general' && (
          <div className="space-y-6">
            {/* デフォルト時間帯設定 */}
            <div className="p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                  デフォルト時間帯設定
                </h3>
              </div>
              
              <div className="grid grid-cols-1 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    時間帯
                  </label>
                  <select
                    value={settings.defaultTimeSlot}
                    onChange={(e) => updateSetting('defaultTimeSlot', e.target.value)}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="デフォルト">デフォルト (09:00-18:00)</option>
                    <option value="午前">午前 (09:00-12:00)</option>
                    <option value="午後">午後 (13:00-17:00)</option>
                    <option value="夜間">夜間 (18:00-22:00)</option>
                    <option value="カスタム">カスタム</option>
                  </select>
                </div>

                {settings.defaultTimeSlot === 'カスタム' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        開始時刻
                      </label>
                      <input
                        type="time"
                        value={settings.customTimeStart}
                        onChange={(e) => updateSetting('customTimeStart', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        終了時刻
                      </label>
                      <input
                        type="time"
                        value={settings.customTimeEnd}
                        onChange={(e) => updateSetting('customTimeEnd', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* デフォルト会議設定 */}
            <div className="p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
                デフォルト会議設定
              </h3>
              
              <div className="grid grid-cols-1 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    会議時間
                  </label>
                  <select
                    value={settings.defaultMeetingDuration}
                    onChange={(e) => updateSetting('defaultMeetingDuration', e.target.value)}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="15分">15分</option>
                    <option value="30分">30分</option>
                    <option value="45分">45分</option>
                    <option value="60分">60分</option>
                    <option value="90分">90分</option>
                    <option value="120分">120分</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    前の余白時間
                  </label>
                  <select
                    value={settings.defaultBufferBefore}
                    onChange={(e) => updateSetting('defaultBufferBefore', e.target.value)}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="0分">なし</option>
                    <option value="10分">10分</option>
                    <option value="20分">20分</option>
                    <option value="30分">30分</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    後の余白時間
                  </label>
                  <select
                    value={settings.defaultBufferAfter}
                    onChange={(e) => updateSetting('defaultBufferAfter', e.target.value)}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="0分">なし</option>
                    <option value="10分">10分</option>
                    <option value="20分">20分</option>
                    <option value="30分">30分</option>
                  </select>
                </div>
              </div>
            </div>

            {/* UI設定 */}
            <div className="p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
                UI設定
              </h3>
              
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    テーマ
                  </label>
                  <div className="flex flex-wrap gap-2 sm:gap-3">
                    {[
                      { value: 'light', label: 'ライト', icon: Sun },
                      { value: 'dark', label: 'ダーク', icon: Moon },
                      { value: 'system', label: 'システム', icon: Laptop },
                    ].map(({ value, label, icon: Icon }) => (
                      <button
                        key={value}
                        onClick={() => {
                          setThemeMode(value as 'light' | 'dark' | 'system');
                          updateSetting('theme', value as 'light' | 'dark' | 'system');
                        }}
                        className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg border transition-colors text-sm sm:text-base ${
                          themeMode === value
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                            : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{label}</span>
                        {value === 'system' && (
                          <span className="text-xs opacity-60 hidden sm:inline">
                            ({systemTheme === 'dark' ? 'ダーク' : 'ライト'})
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    システムテーマはブラウザの設定に従います
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="autoSearch"
                    checked={settings.autoSearch}
                    onChange={(e) => updateSetting('autoSearch', e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="autoSearch" className="text-sm text-gray-700 dark:text-gray-300">
                    設定変更時に自動で検索を実行する
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="showDebugInfo"
                    checked={settings.showDebugInfo}
                    onChange={(e) => updateSetting('showDebugInfo', e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="showDebugInfo" className="text-sm text-gray-700 dark:text-gray-300">
                    デバッグ情報を表示する
                  </label>
                </div>
              </div>
            </div>

            {/* 設定の管理 */}
            <div className="p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
                設定の管理
              </h3>
              
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-3">
                <button
                  onClick={handleSaveSettings}
                  disabled={isSaving}
                  className="flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm sm:text-base"
                >
                  {isSaving ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span className="hidden sm:inline">{isSaving ? '保存中...' : '設定を保存'}</span>
                  <span className="sm:hidden">保存</span>
                </button>

                <button
                  onClick={exportSettings}
                  className="flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm sm:text-base"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">エクスポート</span>
                  <span className="sm:hidden">出力</span>
                </button>

                <label className="flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 cursor-pointer text-sm sm:text-base">
                  <Upload className="w-4 h-4" />
                  <span className="hidden sm:inline">インポート</span>
                  <span className="sm:hidden">入力</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportFile}
                    className="hidden"
                  />
                </label>

                <button
                  onClick={resetSettings}
                  className="flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm sm:text-base col-span-2 sm:col-span-1"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span className="hidden sm:inline">リセット</span>
                  <span className="sm:hidden">初期化</span>
                </button>
              </div>

              {importError && (
                <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-800 dark:text-red-200">❌ {importError}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'favorites' && (
          <div className="p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
              お気に入りメンバー ({settings.favoriteMembers.length}名)
            </h3>
            
            {settings.favoriteMembers.length > 0 ? (
              <div className="space-y-2 sm:space-y-3">
                {settings.favoriteMembers.map((member) => (
                  <div
                    key={member.email}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                      <UserAvatar
                        name={member.name}
                        email={member.email}
                        source="organization"
                        size="sm"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-gray-900 dark:text-white truncate text-sm sm:text-base">
                          {member.name}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                          {member.email}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFavoriteMember(member.email)}
                      className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 flex-shrink-0"
                      title="お気に入りから削除"
                    >
                      <Star className="w-4 h-4 fill-current" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Star className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>お気に入りメンバーはまだありません</p>
                <p className="text-sm">メンバー選択画面でお気に入りを追加できます</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                検索履歴 ({settings.searchHistory.length}件)
              </h3>
              {settings.searchHistory.length > 0 && (
                <button
                  onClick={clearSearchHistory}
                  className="text-xs sm:text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                  すべて削除
                </button>
              )}
            </div>
            
            {settings.searchHistory.length > 0 ? (
              <div className="space-y-2 sm:space-y-3">
                {settings.searchHistory.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        {new Date(item.timestamp).toLocaleString('ja-JP')}
                      </div>
                      <button
                        onClick={() => removeSearchHistory(item.id)}
                        className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-xs sm:text-sm"
                      >
                        削除
                      </button>
                    </div>
                    <div className="space-y-1 text-xs sm:text-sm">
                      <div>
                        <span className="font-medium">参加者:</span> {item.participants.join(', ')}
                      </div>
                      <div>
                        <span className="font-medium">時間帯:</span> {item.timeSlot}
                        {item.customTimeStart && item.customTimeEnd && (
                          <span> ({item.customTimeStart} - {item.customTimeEnd})</span>
                        )}
                      </div>
                      <div>
                        <span className="font-medium">会議時間:</span> {item.meetingDuration}
                        {(item.bufferTimeBefore !== '0分' || item.bufferTimeAfter !== '0分') && (
                          <span> (前:{item.bufferTimeBefore}, 後:{item.bufferTimeAfter})</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>検索履歴はまだありません</p>
                <p className="text-sm">スケジュール検索を実行すると履歴が記録されます</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}