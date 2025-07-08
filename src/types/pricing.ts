// 課金・サブスクリプション関連の型定義

export type PlanType = 'free' | 'pro' | 'enterprise';

export type SubscriptionStatus = 'active' | 'canceled' | 'expired' | 'trial' | 'pending' | 'incomplete';

export type BillingPeriod = 'monthly' | 'yearly';

export interface PricingPlan {
  readonly id: string;
  readonly name: string;
  readonly type: PlanType;
  readonly price: number;
  readonly currency: string;
  readonly billingPeriod: BillingPeriod;
  readonly features: readonly PlanFeature[];
  readonly limits: PlanLimits;
  readonly isPopular?: boolean;
  readonly description?: string;
}

export interface PlanFeature {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly included: boolean;
  readonly limit?: number;
}

export interface PlanLimits {
  readonly maxMembers: number; // -1 = unlimited
  readonly maxSearchesPerMonth: number; // -1 = unlimited
  readonly maxHistoryItems: number; // -1 = unlimited
  readonly maxFavoriteMembers: number; // -1 = unlimited
  readonly canExportResults: boolean;
  readonly canUseAdvancedFilters: boolean;
  readonly canAccessCalendarIntegration: boolean;
  readonly canUseTeamFeatures: boolean;
}

export interface UserSubscription {
  readonly id: string;
  readonly userId: string;
  readonly planType: PlanType;
  readonly status: SubscriptionStatus;
  readonly currentPeriodStart: string; // ISO date string
  readonly currentPeriodEnd: string; // ISO date string
  readonly cancelAtPeriodEnd: boolean;
  readonly trialEndsAt?: string; // ISO date string
  readonly createdAt: string; // ISO date string
  readonly updatedAt: string; // ISO date string
  readonly stripeSubscriptionId?: string;
  readonly stripeCustomerId?: string;
}

export interface UsageStats {
  readonly userId: string;
  readonly planType: PlanType;
  readonly currentPeriodStart: string; // ISO date string
  readonly currentPeriodEnd: string; // ISO date string
  readonly searchesThisMonth: number;
  readonly membersUsed: number;
  readonly lastSearchAt?: string; // ISO date string
}

export interface FeatureAccess {
  readonly canUseFeature: boolean;
  readonly reason?: string;
  readonly upgradeRequired?: boolean;
  readonly currentUsage?: number;
  readonly limit?: number; // -1 = unlimited
}

// デフォルトプラン設定
export const DEFAULT_PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    type: 'free',
    price: 0,
    currency: 'JPY',
    billingPeriod: 'monthly',
    features: [
      { id: 'members', name: 'メンバー数', description: '最大3名まで', included: true, limit: 3 },
      { id: 'searches', name: '月間検索回数', description: '月20回まで', included: true, limit: 20 },
      { id: 'history', name: '検索履歴', description: '最新10件まで', included: true, limit: 10 },
      { id: 'favorites', name: 'お気に入りメンバー', description: '最大5名まで', included: true, limit: 5 },
      { id: 'export', name: '結果エクスポート', description: 'テキストのみ', included: true },
      { id: 'calendar', name: 'カレンダー連携', description: 'Google Calendar', included: true },
      { id: 'support', name: 'サポート', description: 'コミュニティ', included: true },
    ],
    limits: {
      maxMembers: 3,
      maxSearchesPerMonth: 20,
      maxHistoryItems: 10,
      maxFavoriteMembers: 5,
      canExportResults: true,
      canUseAdvancedFilters: false,
      canAccessCalendarIntegration: true,
      canUseTeamFeatures: false,
    },
    description: '個人利用や小規模チームに最適',
  },
  {
    id: 'pro',
    name: 'Pro',
    type: 'pro',
    price: 980,
    currency: 'JPY',
    billingPeriod: 'monthly',
    isPopular: true,
    features: [
      { id: 'members', name: 'メンバー数', description: '最大15名まで', included: true, limit: 15 },
      { id: 'searches', name: '月間検索回数', description: '無制限', included: true },
      { id: 'history', name: '検索履歴', description: '最新100件まで', included: true, limit: 100 },
      { id: 'favorites', name: 'お気に入りメンバー', description: '最大50名まで', included: true, limit: 50 },
      { id: 'export', name: '結果エクスポート', description: 'CSV、PDF対応', included: true },
      { id: 'filters', name: '高度なフィルター', description: '詳細条件設定', included: true },
      { id: 'calendar', name: 'カレンダー連携', description: 'Google Calendar', included: true },
      { id: 'support', name: 'サポート', description: 'メール対応', included: true },
    ],
    limits: {
      maxMembers: 15,
      maxSearchesPerMonth: -1, // 無制限
      maxHistoryItems: 100,
      maxFavoriteMembers: 50,
      canExportResults: true,
      canUseAdvancedFilters: true,
      canAccessCalendarIntegration: true,
      canUseTeamFeatures: true,
    },
    description: '中規模チームや頻繁に利用する方に最適',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    type: 'enterprise',
    price: 2980,
    currency: 'JPY',
    billingPeriod: 'monthly',
    features: [
      { id: 'members', name: 'メンバー数', description: '無制限', included: true },
      { id: 'searches', name: '月間検索回数', description: '無制限', included: true },
      { id: 'history', name: '検索履歴', description: '無制限', included: true },
      { id: 'favorites', name: 'お気に入りメンバー', description: '無制限', included: true },
      { id: 'export', name: '結果エクスポート', description: 'CSV、PDF、Excel対応', included: true },
      { id: 'filters', name: '高度なフィルター', description: '詳細条件設定', included: true },
      { id: 'calendar', name: 'カレンダー連携', description: 'Google Calendar', included: true },
      { id: 'team', name: 'チーム管理', description: '組織・権限管理', included: true },
      { id: 'support', name: 'サポート', description: '優先サポート', included: true },
    ],
    limits: {
      maxMembers: -1, // 無制限
      maxSearchesPerMonth: -1, // 無制限
      maxHistoryItems: -1, // 無制限
      maxFavoriteMembers: -1, // 無制限
      canExportResults: true,
      canUseAdvancedFilters: true,
      canAccessCalendarIntegration: true,
      canUseTeamFeatures: true,
    },
    description: '大規模組織や企業利用に最適',
  },
];

// デフォルトの無料プラン制限
export const FREE_PLAN_LIMITS = DEFAULT_PLANS.find(p => p.type === 'free')?.limits || {
  maxMembers: 3,
  maxSearchesPerMonth: 20,
  maxHistoryItems: 10,
  maxFavoriteMembers: 5,
  canExportResults: true,
  canUseAdvancedFilters: false,
  canAccessCalendarIntegration: true,
  canUseTeamFeatures: false,
};