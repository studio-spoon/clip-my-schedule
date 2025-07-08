'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { 
  PlanType, 
  UserSubscription, 
  UsageStats, 
  FeatureAccess, 
  PricingPlan, 
  DEFAULT_PLANS 
} from '@/types/pricing';
import { PricingService } from '@/lib/pricing';
import { 
  isValidUserSubscription, 
  isValidUsageStats, 
  safePlanType,
  safeSubscriptionStatus 
} from '@/lib/pricing-validators';

export function usePricing() {
  const { data: session } = useSession();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 現在のプランタイプを取得
  const getCurrentPlan = useCallback((): PlanType => {
    if (!subscription) return 'free';
    
    if (PricingService.isSubscriptionActive(subscription) || PricingService.isInTrial(subscription)) {
      return subscription.planType;
    }
    
    return 'free';
  }, [subscription]);

  // プラン情報を取得
  const getPlanInfo = useCallback((planType?: PlanType): PricingPlan | null => {
    const targetPlan = planType || getCurrentPlan();
    return DEFAULT_PLANS.find(p => p.type === targetPlan) || null;
  }, [getCurrentPlan]);

  // 機能アクセス権限チェック
  const checkFeatureAccess = useCallback((methodName: string, ...args: unknown[]): FeatureAccess => {
    const currentPlan = getCurrentPlan();
    
    // PricingServiceのメソッドを動的に呼び出し
    switch (methodName) {
      case 'canAddMember':
        return PricingService.canAddMember(currentPlan, args[0] as number);
      case 'canPerformSearch':
        return PricingService.canPerformSearch(currentPlan, args[0] as number);
      case 'canSaveHistory':
        return PricingService.canSaveHistory(currentPlan, args[0] as number);
      case 'canAddFavoriteMember':
        return PricingService.canAddFavoriteMember(currentPlan, args[0] as number);
      case 'canExportResults':
        return PricingService.canExportResults(currentPlan);
      case 'canUseAdvancedFilters':
        return PricingService.canUseAdvancedFilters(currentPlan);
      case 'canUseTeamFeatures':
        return PricingService.canUseTeamFeatures(currentPlan);
      default:
        return { canUseFeature: true };
    }
  }, [getCurrentPlan]);

  // サブスクリプション情報を読み込み
  const loadSubscription = useCallback(async () => {
    if (!session?.user?.email) {
      setSubscription(null);
      setUsageStats(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // TODO: 実際のAPIエンドポイントに置き換え
      // const response = await fetch('/api/subscription');
      // const data = await response.json();
      
      // 仮のデータ（開発用）
      const mockSubscriptionData = {
        id: 'mock-subscription',
        userId: session.user.email,
        planType: 'free' as const,
        status: 'active' as const,
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        cancelAtPeriodEnd: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const mockUsageData = {
        userId: session.user.email,
        planType: 'free' as const,
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        searchesThisMonth: 0,
        membersUsed: 0,
      };

      // データの妥当性を検証
      if (isValidUserSubscription(mockSubscriptionData)) {
        setSubscription(mockSubscriptionData);
      } else {
        throw new Error('Invalid subscription data');
      }

      if (isValidUsageStats(mockUsageData)) {
        setUsageStats(mockUsageData);
      } else {
        throw new Error('Invalid usage stats data');
      }
    } catch (err) {
      setError('サブスクリプション情報の読み込みに失敗しました');
      console.error('Subscription loading error:', err);
      
      // エラー時のフォールバック
      setSubscription(null);
      setUsageStats(null);
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.email]);

  // 使用量を更新
  const updateUsage = useCallback(async (type: 'search' | 'member', increment: number = 1) => {
    if (!usageStats) {
      console.warn('Usage stats not available');
      return;
    }

    // incrementの妥当性を検証
    const validIncrement = typeof increment === 'number' && increment >= 0 ? increment : 1;

    try {
      const updatedStats = { ...usageStats };
      
      if (type === 'search') {
        updatedStats.searchesThisMonth = Math.max(0, updatedStats.searchesThisMonth + validIncrement);
        updatedStats.lastSearchAt = new Date().toISOString();
      } else if (type === 'member') {
        updatedStats.membersUsed = Math.max(0, updatedStats.membersUsed + validIncrement);
      }

      // 更新されたデータの妥当性を検証
      if (isValidUsageStats(updatedStats)) {
        setUsageStats(updatedStats);
      } else {
        throw new Error('Invalid updated usage stats');
      }

      // TODO: APIに使用量を送信
      // await fetch('/api/usage', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ type, increment: validIncrement })
      // });
    } catch (err) {
      console.error('Failed to update usage:', err);
    }
  }, [usageStats]);

  // 初期化
  useEffect(() => {
    loadSubscription();
  }, [loadSubscription]);

  return {
    // 状態
    subscription,
    usageStats,
    isLoading,
    error,
    
    // 計算値
    currentPlan: getCurrentPlan(),
    planInfo: getPlanInfo(),
    isFreePlan: getCurrentPlan() === 'free',
    isPaidPlan: getCurrentPlan() !== 'free',
    isTrialActive: subscription ? PricingService.isInTrial(subscription) : false,
    
    // 機能アクセス権限
    canAddMember: (currentCount: number) => checkFeatureAccess('canAddMember', currentCount),
    canPerformSearch: (searchCount: number) => checkFeatureAccess('canPerformSearch', searchCount),
    canSaveHistory: (historyCount: number) => checkFeatureAccess('canSaveHistory', historyCount),
    canAddFavoriteMember: (favoriteCount: number) => checkFeatureAccess('canAddFavoriteMember', favoriteCount),
    canExportResults: () => checkFeatureAccess('canExportResults'),
    canUseAdvancedFilters: () => checkFeatureAccess('canUseAdvancedFilters'),
    canUseTeamFeatures: () => checkFeatureAccess('canUseTeamFeatures'),
    
    // アクション
    updateUsage,
    refresh: loadSubscription,
    getPlanInfo,
    getUpgradeOptions: () => PricingService.getUpgradeOptions(getCurrentPlan()),
    getRecommendedPlan: () => usageStats ? PricingService.getRecommendedPlan(usageStats) : 'free',
  };
}