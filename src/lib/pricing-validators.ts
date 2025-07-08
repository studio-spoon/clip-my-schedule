// 課金・サブスクリプション関連のバリデーション

import { 
  PlanType, 
  SubscriptionStatus, 
  BillingPeriod, 
  PricingPlan, 
  UserSubscription, 
  UsageStats,
  FeatureAccess,
  PlanLimits 
} from '@/types/pricing';

/**
 * プランタイプの妥当性を検証
 */
export function isValidPlanType(value: unknown): value is PlanType {
  return typeof value === 'string' && ['free', 'pro', 'enterprise'].includes(value);
}

/**
 * サブスクリプション状態の妥当性を検証
 */
export function isValidSubscriptionStatus(value: unknown): value is SubscriptionStatus {
  return typeof value === 'string' && 
    ['active', 'canceled', 'expired', 'trial', 'pending', 'incomplete'].includes(value);
}

/**
 * 請求期間の妥当性を検証
 */
export function isValidBillingPeriod(value: unknown): value is BillingPeriod {
  return typeof value === 'string' && ['monthly', 'yearly'].includes(value);
}

/**
 * ISO日付文字列の妥当性を検証
 */
export function isValidISODateString(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  
  const date = new Date(value);
  return !isNaN(date.getTime()) && date.toISOString() === value;
}

/**
 * プラン制限の妥当性を検証
 */
export function isValidPlanLimits(limits: unknown): limits is PlanLimits {
  if (typeof limits !== 'object' || limits === null) return false;
  
  const l = limits as Record<string, unknown>;
  
  return (
    typeof l.maxMembers === 'number' && (l.maxMembers === -1 || l.maxMembers >= 0) &&
    typeof l.maxSearchesPerMonth === 'number' && (l.maxSearchesPerMonth === -1 || l.maxSearchesPerMonth >= 0) &&
    typeof l.maxHistoryItems === 'number' && (l.maxHistoryItems === -1 || l.maxHistoryItems >= 0) &&
    typeof l.maxFavoriteMembers === 'number' && (l.maxFavoriteMembers === -1 || l.maxFavoriteMembers >= 0) &&
    typeof l.canExportResults === 'boolean' &&
    typeof l.canUseAdvancedFilters === 'boolean' &&
    typeof l.canAccessCalendarIntegration === 'boolean' &&
    typeof l.canUseTeamFeatures === 'boolean'
  );
}

/**
 * プライシングプランの妥当性を検証
 */
export function isValidPricingPlan(plan: unknown): plan is PricingPlan {
  if (typeof plan !== 'object' || plan === null) return false;
  
  const p = plan as Record<string, unknown>;
  
  return (
    typeof p.id === 'string' && p.id.length > 0 &&
    typeof p.name === 'string' && p.name.length > 0 &&
    isValidPlanType(p.type) &&
    typeof p.price === 'number' && p.price >= 0 &&
    typeof p.currency === 'string' && p.currency.length > 0 &&
    isValidBillingPeriod(p.billingPeriod) &&
    Array.isArray(p.features) &&
    isValidPlanLimits(p.limits) &&
    (p.isPopular === undefined || typeof p.isPopular === 'boolean') &&
    (p.description === undefined || typeof p.description === 'string')
  );
}

/**
 * ユーザーサブスクリプションの妥当性を検証
 */
export function isValidUserSubscription(subscription: unknown): subscription is UserSubscription {
  if (typeof subscription !== 'object' || subscription === null) return false;
  
  const s = subscription as Record<string, unknown>;
  
  return (
    typeof s.id === 'string' && s.id.length > 0 &&
    typeof s.userId === 'string' && s.userId.length > 0 &&
    isValidPlanType(s.planType) &&
    isValidSubscriptionStatus(s.status) &&
    isValidISODateString(s.currentPeriodStart) &&
    isValidISODateString(s.currentPeriodEnd) &&
    typeof s.cancelAtPeriodEnd === 'boolean' &&
    (s.trialEndsAt === undefined || isValidISODateString(s.trialEndsAt)) &&
    isValidISODateString(s.createdAt) &&
    isValidISODateString(s.updatedAt) &&
    (s.stripeSubscriptionId === undefined || typeof s.stripeSubscriptionId === 'string') &&
    (s.stripeCustomerId === undefined || typeof s.stripeCustomerId === 'string')
  );
}

/**
 * 使用統計の妥当性を検証
 */
export function isValidUsageStats(stats: unknown): stats is UsageStats {
  if (typeof stats !== 'object' || stats === null) return false;
  
  const s = stats as Record<string, unknown>;
  
  return (
    typeof s.userId === 'string' && s.userId.length > 0 &&
    isValidPlanType(s.planType) &&
    isValidISODateString(s.currentPeriodStart) &&
    isValidISODateString(s.currentPeriodEnd) &&
    typeof s.searchesThisMonth === 'number' && s.searchesThisMonth >= 0 &&
    typeof s.membersUsed === 'number' && s.membersUsed >= 0 &&
    (s.lastSearchAt === undefined || isValidISODateString(s.lastSearchAt))
  );
}

/**
 * 機能アクセス権限の妥当性を検証
 */
export function isValidFeatureAccess(access: unknown): access is FeatureAccess {
  if (typeof access !== 'object' || access === null) return false;
  
  const a = access as Record<string, unknown>;
  
  return (
    typeof a.canUseFeature === 'boolean' &&
    (a.reason === undefined || typeof a.reason === 'string') &&
    (a.upgradeRequired === undefined || typeof a.upgradeRequired === 'boolean') &&
    (a.currentUsage === undefined || (typeof a.currentUsage === 'number' && a.currentUsage >= 0)) &&
    (a.limit === undefined || (typeof a.limit === 'number' && (a.limit === -1 || a.limit >= 0)))
  );
}

/**
 * 安全にプランタイプを取得（フォールバック付き）
 */
export function safePlanType(value: unknown, fallback: PlanType = 'free'): PlanType {
  return isValidPlanType(value) ? value : fallback;
}

/**
 * 安全にサブスクリプション状態を取得（フォールバック付き）
 */
export function safeSubscriptionStatus(value: unknown, fallback: SubscriptionStatus = 'expired'): SubscriptionStatus {
  return isValidSubscriptionStatus(value) ? value : fallback;
}

/**
 * 数値制限の妥当性を検証（-1は無制限として許可）
 */
export function isValidLimit(value: unknown): value is number {
  return typeof value === 'number' && (value === -1 || value >= 0);
}

/**
 * 使用量が制限内かチェック
 */
export function isWithinLimit(usage: number, limit: number): boolean {
  if (limit === -1) return true; // 無制限
  return usage < limit;
}

/**
 * 使用率を計算（0-1の範囲）
 */
export function calculateUsageRatio(usage: number, limit: number): number {
  if (limit === -1) return 0; // 無制限の場合は0%
  if (limit === 0) return 1; // 制限が0の場合は100%
  return Math.min(usage / limit, 1);
}