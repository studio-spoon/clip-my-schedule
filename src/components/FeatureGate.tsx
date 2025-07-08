'use client';

import React, { ReactNode } from 'react';
import { Lock, Crown, AlertTriangle } from 'lucide-react';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';

interface FeatureGateProps {
  children: ReactNode;
  feature: 'member' | 'search' | 'history' | 'favorite' | 'export' | 'advanced' | 'team';
  fallback?: ReactNode;
  showUpgradePrompt?: boolean;
  className?: string;
}

export default function FeatureGate({ 
  children, 
  feature, 
  fallback, 
  showUpgradePrompt = true,
  className = ''
}: FeatureGateProps) {
  const featureFlags = useFeatureFlags();

  // 機能の利用可能性をチェック
  const checkFeatureAccess = (): boolean => {
    switch (feature) {
      case 'member':
        return featureFlags.canAddNewMember;
      case 'search':
        return featureFlags.canPerformSearch;
      case 'history':
        return featureFlags.canSaveSearchHistory;
      case 'favorite':
        return featureFlags.canAddToFavorites;
      case 'export':
        return featureFlags.canExportResults;
      case 'advanced':
        return featureFlags.canUseAdvancedFilters;
      case 'team':
        return featureFlags.canUseTeamFeatures;
      default:
        return true;
    }
  };

  const canUseFeature = checkFeatureAccess();

  // 機能が使用可能な場合はそのまま表示
  if (canUseFeature) {
    return <>{children}</>;
  }

  // カスタムフォールバックが指定されている場合
  if (fallback) {
    return <>{fallback}</>;
  }

  // アップグレードプロンプトを表示しない場合は何も表示しない
  if (!showUpgradePrompt) {
    return null;
  }

  // 機能名の日本語マッピング
  const getFeatureName = (feature: string): string => {
    switch (feature) {
      case 'member':
        return 'メンバー追加';
      case 'search':
        return 'スケジュール検索';
      case 'history':
        return '検索履歴保存';
      case 'favorite':
        return 'お気に入り追加';
      case 'export':
        return '結果エクスポート';
      case 'advanced':
        return '高度なフィルター';
      case 'team':
        return 'チーム機能';
      default:
        return '機能';
    }
  };

  // 制限理由の取得
  const getLimitReason = (feature: string): string => {
    switch (feature) {
      case 'member':
        return `メンバー数の上限（${featureFlags.memberLimit}名）に達しました`;
      case 'search':
        return `今月の検索回数の上限（${featureFlags.searchLimit}回）に達しました`;
      case 'history':
        return `検索履歴の上限（${featureFlags.historyLimit}件）に達しました`;
      case 'favorite':
        return `お気に入りメンバーの上限（${featureFlags.favoriteLimit}名）に達しました`;
      case 'export':
        return 'エクスポート機能は有料プランでのみご利用いただけます';
      case 'advanced':
        return '高度なフィルター機能は有料プランでのみご利用いただけます';
      case 'team':
        return 'チーム機能は有料プランでのみご利用いただけます';
      default:
        return 'この機能は有料プランでのみご利用いただけます';
    }
  };

  // アップグレードプロンプトを表示
  return (
    <div className={`bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 ${className}`}>
      <div className="flex items-center gap-3 mb-3">
        <div className="flex items-center justify-center w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full">
          <Lock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {getFeatureName(feature)}が制限されています
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {getLimitReason(feature)}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            // TODO: 料金プランページへの遷移
            console.log('Navigate to pricing page');
          }}
          className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-md transition-colors"
        >
          <Crown className="w-3 h-3" />
          プランをアップグレード
        </button>
        
        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
          <AlertTriangle className="w-3 h-3" />
          <span>制限を解除するには有料プランが必要です</span>
        </div>
      </div>
    </div>
  );
}