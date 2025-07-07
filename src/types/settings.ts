// ユーザー設定の型定義

export interface SearchHistory {
  id: string;
  timestamp: string;
  participants: string[];
  timeSlot: string;
  customTimeStart?: string;
  customTimeEnd?: string;
  meetingDuration: string;
  bufferTimeBefore: string;
  bufferTimeAfter: string;
}

export interface FavoriteMember {
  email: string;
  name: string;
  addedAt: string;
}

export interface UserSettings {
  // デフォルト時間帯設定
  defaultTimeSlot: string;
  customTimeStart: string;
  customTimeEnd: string;
  
  // デフォルト会議設定
  defaultMeetingDuration: string;
  defaultBufferBefore: string;
  defaultBufferAfter: string;
  
  // UI設定
  theme: 'light' | 'dark' | 'system';
  
  // よく使うメンバー
  favoriteMembers: FavoriteMember[];
  
  // 検索履歴 (最新20件まで)
  searchHistory: SearchHistory[];
  
  // その他の設定
  autoSearch: boolean; // 設定変更時の自動検索
  showDebugInfo: boolean; // デバッグ情報の表示
  
  // 設定のメタデータ
  version: string;
  createdAt: string;
  updatedAt: string;
}

// デフォルト設定
export const DEFAULT_USER_SETTINGS: UserSettings = {
  defaultTimeSlot: 'デフォルト',
  customTimeStart: '09:00',
  customTimeEnd: '18:00',
  defaultMeetingDuration: '60分',
  defaultBufferBefore: '10分',
  defaultBufferAfter: '10分',
  theme: 'system',
  favoriteMembers: [],
  searchHistory: [],
  autoSearch: true,
  showDebugInfo: false,
  version: '1.0.0',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// 設定のバリデーション
export const validateUserSettings = (settings: any): settings is UserSettings => {
  return (
    typeof settings === 'object' &&
    typeof settings.defaultTimeSlot === 'string' &&
    typeof settings.customTimeStart === 'string' &&
    typeof settings.customTimeEnd === 'string' &&
    typeof settings.defaultMeetingDuration === 'string' &&
    typeof settings.defaultBufferBefore === 'string' &&
    typeof settings.defaultBufferAfter === 'string' &&
    ['light', 'dark', 'system'].includes(settings.theme) &&
    Array.isArray(settings.favoriteMembers) &&
    Array.isArray(settings.searchHistory) &&
    typeof settings.autoSearch === 'boolean' &&
    typeof settings.showDebugInfo === 'boolean'
  );
};