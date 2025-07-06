'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { UserSettings, DEFAULT_USER_SETTINGS, validateUserSettings, SearchHistory, FavoriteMember } from '@/types/settings';

const STORAGE_KEY_PREFIX = 'clip-my-schedule-settings-';

export function useUserSettings() {
  const { data: session } = useSession();
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_USER_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ストレージキーを生成
  const getStorageKey = useCallback(() => {
    if (!session?.user?.email) return null;
    return `${STORAGE_KEY_PREFIX}${session.user.email}`;
  }, [session?.user?.email]);

  // 設定を読み込み
  const loadSettings = useCallback(() => {
    const storageKey = getStorageKey();
    if (!storageKey) {
      setSettings(DEFAULT_USER_SETTINGS);
      setIsLoading(false);
      return;
    }

    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (validateUserSettings(parsed)) {
          setSettings(parsed);
        } else {
          console.warn('Invalid user settings found, using defaults');
          setSettings(DEFAULT_USER_SETTINGS);
        }
      } else {
        // 初回訪問時のデフォルト設定保存
        setSettings(DEFAULT_USER_SETTINGS);
        localStorage.setItem(storageKey, JSON.stringify(DEFAULT_USER_SETTINGS));
      }
    } catch (err) {
      console.error('Failed to load user settings:', err);
      setError('設定の読み込みに失敗しました');
      setSettings(DEFAULT_USER_SETTINGS);
    } finally {
      setIsLoading(false);
    }
  }, [getStorageKey]);

  // 設定を保存
  const saveSettings = useCallback((newSettings: UserSettings) => {
    const storageKey = getStorageKey();
    if (!storageKey) return;

    try {
      const updatedSettings = {
        ...newSettings,
        updatedAt: new Date().toISOString(),
      };
      
      localStorage.setItem(storageKey, JSON.stringify(updatedSettings));
      setSettings(updatedSettings);
      setError(null);
    } catch (err) {
      console.error('Failed to save user settings:', err);
      setError('設定の保存に失敗しました');
    }
  }, [getStorageKey]);

  // 個別設定の更新
  const updateSetting = useCallback(<K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K]
  ) => {
    const newSettings = { ...settings, [key]: value };
    saveSettings(newSettings);
  }, [settings, saveSettings]);

  // お気に入りメンバーの追加
  const addFavoriteMember = useCallback((member: Omit<FavoriteMember, 'addedAt'>) => {
    const newFavorite: FavoriteMember = {
      ...member,
      addedAt: new Date().toISOString(),
    };
    
    const existingIndex = settings.favoriteMembers.findIndex(fav => fav.email === member.email);
    let newFavorites: FavoriteMember[];
    
    if (existingIndex >= 0) {
      // 既存の場合は更新
      newFavorites = [...settings.favoriteMembers];
      newFavorites[existingIndex] = newFavorite;
    } else {
      // 新規追加（最大20件まで）
      newFavorites = [newFavorite, ...settings.favoriteMembers].slice(0, 20);
    }
    
    updateSetting('favoriteMembers', newFavorites);
  }, [settings.favoriteMembers, updateSetting]);

  // お気に入りメンバーの削除
  const removeFavoriteMember = useCallback((email: string) => {
    const newFavorites = settings.favoriteMembers.filter(fav => fav.email !== email);
    updateSetting('favoriteMembers', newFavorites);
  }, [settings.favoriteMembers, updateSetting]);

  // 検索履歴の追加
  const addSearchHistory = useCallback((search: Omit<SearchHistory, 'id' | 'timestamp'>) => {
    const newHistoryItem: SearchHistory = {
      ...search,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    };
    
    // 重複する検索を削除してから追加（最新20件まで）
    const filteredHistory = settings.searchHistory.filter(
      item => JSON.stringify({
        participants: item.participants,
        timeSlot: item.timeSlot,
        customTimeStart: item.customTimeStart,
        customTimeEnd: item.customTimeEnd,
        meetingDuration: item.meetingDuration,
        bufferTimeBefore: item.bufferTimeBefore,
        bufferTimeAfter: item.bufferTimeAfter,
      }) !== JSON.stringify({
        participants: search.participants,
        timeSlot: search.timeSlot,
        customTimeStart: search.customTimeStart,
        customTimeEnd: search.customTimeEnd,
        meetingDuration: search.meetingDuration,
        bufferTimeBefore: search.bufferTimeBefore,
        bufferTimeAfter: search.bufferTimeAfter,
      })
    );
    
    const newHistory = [newHistoryItem, ...filteredHistory].slice(0, 20);
    updateSetting('searchHistory', newHistory);
  }, [settings.searchHistory, updateSetting]);

  // 検索履歴の削除
  const removeSearchHistory = useCallback((id: string) => {
    const newHistory = settings.searchHistory.filter(item => item.id !== id);
    updateSetting('searchHistory', newHistory);
  }, [settings.searchHistory, updateSetting]);

  // 検索履歴の全削除
  const clearSearchHistory = useCallback(() => {
    updateSetting('searchHistory', []);
  }, [updateSetting]);

  // 設定のリセット
  const resetSettings = useCallback(() => {
    const newSettings = {
      ...DEFAULT_USER_SETTINGS,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveSettings(newSettings);
  }, [saveSettings]);

  // 設定のエクスポート
  const exportSettings = useCallback(() => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `clip-my-schedule-settings-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [settings]);

  // 設定のインポート
  const importSettings = useCallback((file: File) => {
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target?.result as string);
          if (validateUserSettings(imported)) {
            saveSettings(imported);
            resolve();
          } else {
            reject(new Error('無効な設定ファイルです'));
          }
        } catch (err) {
          reject(new Error('設定ファイルの読み込みに失敗しました'));
        }
      };
      reader.onerror = () => reject(new Error('ファイルの読み込みに失敗しました'));
      reader.readAsText(file);
    });
  }, [saveSettings]);

  // セッション変更時に設定を再読み込み
  useEffect(() => {
    if (session) {
      loadSettings();
    }
  }, [session, loadSettings]);

  return {
    settings,
    isLoading,
    error,
    updateSetting,
    addFavoriteMember,
    removeFavoriteMember,
    addSearchHistory,
    removeSearchHistory,
    clearSearchHistory,
    resetSettings,
    exportSettings,
    importSettings,
  };
}