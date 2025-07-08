'use client';

import React from 'react';
import { AlertCircle, Crown, TrendingUp, X } from 'lucide-react';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';

interface PricingBannerProps {
  onClose?: () => void;
  compact?: boolean;
}

export default function PricingBanner({ onClose, compact = false }: PricingBannerProps) {
  const featureFlags = useFeatureFlags();

  // 表示する必要がない場合は何も表示しない
  if (!featureFlags.showUpgradePrompt && !featureFlags.showUsageWarning && !featureFlags.showTrialBanner) {
    return null;
  }

  // トライアルバナー
  if (featureFlags.showTrialBanner) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Crown className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <div>
              <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                トライアル期間中
              </h3>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                すべての機能を無料でお試しいただけます
              </p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-blue-400 hover:text-blue-600 dark:text-blue-500 dark:hover:text-blue-300"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // アップグレード促進バナー
  if (featureFlags.showUpgradePrompt) {
    return (
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <div>
              <h3 className="text-sm font-medium text-amber-900 dark:text-amber-100">
                制限に達しました
              </h3>
              <p className="text-xs text-amber-700 dark:text-amber-300">
                {compact ? 'アップグレードして続行' : 'プランをアップグレードして、すべての機能をご利用ください'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                // TODO: 料金プランページへの遷移
                console.log('Navigate to pricing page');
              }}
              className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white text-xs rounded-md transition-colors"
            >
              アップグレード
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="text-amber-400 hover:text-amber-600 dark:text-amber-500 dark:hover:text-amber-300"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 使用量警告バナー
  if (featureFlags.showUsageWarning) {
    const highestUsage = Math.max(
      featureFlags.memberUsageRatio,
      featureFlags.searchUsageRatio,
      featureFlags.historyUsageRatio,
      featureFlags.favoriteUsageRatio
    );

    return (
      <div className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            <div>
              <h3 className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                使用量が上限に近づいています
              </h3>
              <p className="text-xs text-yellow-700 dark:text-yellow-300">
                {compact ? `${Math.round(highestUsage * 100)}%使用中` : `現在の使用量: ${Math.round(highestUsage * 100)}%`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-16 h-2 bg-yellow-200 dark:bg-yellow-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-500 transition-all duration-300"
                style={{ width: `${highestUsage * 100}%` }}
              />
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="text-yellow-400 hover:text-yellow-600 dark:text-yellow-500 dark:hover:text-yellow-300"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}