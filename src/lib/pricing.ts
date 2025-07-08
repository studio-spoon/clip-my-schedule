// 課金・サブスクリプション関連のロジック

import { 
  PlanType, 
  PlanLimits, 
  UserSubscription, 
  UsageStats, 
  FeatureAccess, 
  DEFAULT_PLANS, 
  FREE_PLAN_LIMITS 
} from '@/types/pricing';
import { 
  isValidPlanType,
  isValidUserSubscription,
  isValidUsageStats,
  isWithinLimit,
  calculateUsageRatio,
  safePlanType 
} from '@/lib/pricing-validators';

export class PricingService {
  /**
   * プランタイプに基づいて制限を取得
   */
  static getPlanLimits(planType: unknown): PlanLimits {
    const validPlanType = safePlanType(planType);
    const plan = DEFAULT_PLANS.find(p => p.type === validPlanType);
    return plan?.limits || FREE_PLAN_LIMITS;
  }

  /**
   * 機能へのアクセス権限を確認
   */
  static checkFeatureAccess(
    feature: keyof PlanLimits,
    planType: unknown,
    currentUsage?: number
  ): FeatureAccess {
    const validPlanType = safePlanType(planType);
    const limits = this.getPlanLimits(validPlanType);
    const featureValue = limits[feature];

    // boolean型の機能の場合
    if (typeof featureValue === 'boolean') {
      return {
        canUseFeature: featureValue,
        upgradeRequired: !featureValue,
        reason: featureValue ? undefined : `${String(feature)}は有料プランでのみ利用可能です`,
      };
    }

    // number型の制限の場合
    if (typeof featureValue === 'number') {
      const usage = typeof currentUsage === 'number' && currentUsage >= 0 ? currentUsage : 0;
      
      // 無制限の場合
      if (featureValue === -1) {
        return {
          canUseFeature: true,
          currentUsage: usage,
          limit: -1,
        };
      }

      // 制限がある場合
      const canUse = isWithinLimit(usage, featureValue);
      
      return {
        canUseFeature: canUse,
        upgradeRequired: !canUse,
        currentUsage: usage,
        limit: featureValue,
        reason: canUse ? undefined : `${String(feature)}の上限に達しました。アップグレードが必要です`,
      };
    }

    // デフォルト（アクセス可能）
    return {
      canUseFeature: true,
    };
  }

  /**
   * メンバー追加可能かチェック
   */
  static canAddMember(planType: unknown, currentMemberCount: unknown): FeatureAccess {
    const count = typeof currentMemberCount === 'number' && currentMemberCount >= 0 ? currentMemberCount : 0;
    return this.checkFeatureAccess('maxMembers', planType, count);
  }

  /**
   * 検索実行可能かチェック
   */
  static canPerformSearch(planType: unknown, searchesThisMonth: unknown): FeatureAccess {
    const searches = typeof searchesThisMonth === 'number' && searchesThisMonth >= 0 ? searchesThisMonth : 0;
    return this.checkFeatureAccess('maxSearchesPerMonth', planType, searches);
  }

  /**
   * 履歴保存可能かチェック
   */
  static canSaveHistory(planType: unknown, currentHistoryCount: unknown): FeatureAccess {
    const history = typeof currentHistoryCount === 'number' && currentHistoryCount >= 0 ? currentHistoryCount : 0;
    return this.checkFeatureAccess('maxHistoryItems', planType, history);
  }

  /**
   * お気に入りメンバー追加可能かチェック
   */
  static canAddFavoriteMember(planType: unknown, currentFavoriteCount: unknown): FeatureAccess {
    const favorites = typeof currentFavoriteCount === 'number' && currentFavoriteCount >= 0 ? currentFavoriteCount : 0;
    return this.checkFeatureAccess('maxFavoriteMembers', planType, favorites);
  }

  /**
   * 結果エクスポート可能かチェック
   */
  static canExportResults(planType: unknown): FeatureAccess {
    return this.checkFeatureAccess('canExportResults', planType);
  }

  /**
   * 高度なフィルター利用可能かチェック
   */
  static canUseAdvancedFilters(planType: unknown): FeatureAccess {
    return this.checkFeatureAccess('canUseAdvancedFilters', planType);
  }

  /**
   * チーム機能利用可能かチェック
   */
  static canUseTeamFeatures(planType: unknown): FeatureAccess {
    return this.checkFeatureAccess('canUseTeamFeatures', planType);
  }

  /**
   * サブスクリプション状態が有効かチェック
   */
  static isSubscriptionActive(subscription: unknown): boolean {
    if (!isValidUserSubscription(subscription)) return false;
    
    try {
      const now = new Date();
      const endDate = new Date(subscription.currentPeriodEnd);
      
      return subscription.status === 'active' && now <= endDate;
    } catch {
      return false;
    }
  }

  /**
   * トライアル期間中かチェック
   */
  static isInTrial(subscription: unknown): boolean {
    if (!isValidUserSubscription(subscription) || !subscription.trialEndsAt) return false;
    
    try {
      const now = new Date();
      const trialEnd = new Date(subscription.trialEndsAt);
      
      return subscription.status === 'trial' && now <= trialEnd;
    } catch {
      return false;
    }
  }

  /**
   * プランのアップグレード可能性をチェック
   */
  static getUpgradeOptions(currentPlan: unknown): PlanType[] {
    const validPlan = safePlanType(currentPlan);
    
    switch (validPlan) {
      case 'free':
        return ['pro', 'enterprise'];
      case 'pro':
        return ['enterprise'];
      case 'enterprise':
        return [];
      default:
        return ['pro', 'enterprise'];
    }
  }

  /**
   * 使用量統計からプラン推奨を計算
   */
  static getRecommendedPlan(usageStats: unknown): PlanType {
    if (!isValidUsageStats(usageStats)) return 'free';
    
    const { searchesThisMonth, membersUsed } = usageStats;

    // Enterpriseプランが必要な条件
    if (membersUsed > 15 || searchesThisMonth > 1000) {
      return 'enterprise';
    }

    // Proプランが必要な条件
    if (membersUsed > 3 || searchesThisMonth > 20) {
      return 'pro';
    }

    // デフォルトは無料プラン
    return 'free';
  }

  /**
   * 使用率を安全に計算
   */
  static calculateUsageRatio(usage: unknown, limit: unknown): number {
    const validUsage = typeof usage === 'number' && usage >= 0 ? usage : 0;
    const validLimit = typeof limit === 'number' ? limit : 0;
    
    return calculateUsageRatio(validUsage, validLimit);
  }
}