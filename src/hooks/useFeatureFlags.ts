'use client';

import { useMemo } from 'react';
import { usePricing } from '@/hooks/usePricing';
import { useUserSettings } from '@/hooks/useUserSettings';
import { useMembers } from '@/hooks/useMembers';

export interface FeatureFlags {
  // メンバー関連
  canAddNewMember: boolean;
  canRemoveMember: boolean;
  canAddToFavorites: boolean;
  maxMembersReached: boolean;
  maxFavoritesReached: boolean;
  
  // 検索関連
  canPerformSearch: boolean;
  canSaveSearchHistory: boolean;
  searchLimitReached: boolean;
  historyLimitReached: boolean;
  
  // エクスポート関連
  canExportResults: boolean;
  canExportToCsv: boolean;
  canExportToPdf: boolean;
  
  // 高度な機能
  canUseAdvancedFilters: boolean;
  canUseTeamFeatures: boolean;
  canAccessAnalytics: boolean;
  
  // UI表示制御
  showUpgradePrompt: boolean;
  showUsageWarning: boolean;
  showTrialBanner: boolean;
  
  // 制限値
  memberLimit: number;
  searchLimit: number;
  historyLimit: number;
  favoriteLimit: number;
  
  // 現在の使用量
  currentMembers: number;
  currentSearches: number;
  currentHistory: number;
  currentFavorites: number;
  
  // 使用率 (0-1)
  memberUsageRatio: number;
  searchUsageRatio: number;
  historyUsageRatio: number;
  favoriteUsageRatio: number;
}

export function useFeatureFlags(): FeatureFlags {
  const { 
    currentPlan, 
    usageStats, 
    isTrialActive,
    canAddMember,
    canPerformSearch,
    canSaveHistory,
    canAddFavoriteMember,
    canExportResults,
    canUseAdvancedFilters,
    canUseTeamFeatures,
    planInfo 
  } = usePricing();
  
  const { settings } = useUserSettings();
  const { teamMembers } = useMembers();

  return useMemo(() => {
    const currentMembers = teamMembers.length;
    const currentSearches = usageStats?.searchesThisMonth || 0;
    const currentHistory = settings.searchHistory.length;
    const currentFavorites = settings.favoriteMembers.length;
    
    const memberLimit = planInfo?.limits.maxMembers || 3;
    const searchLimit = planInfo?.limits.maxSearchesPerMonth || 20;
    const historyLimit = planInfo?.limits.maxHistoryItems || 10;
    const favoriteLimit = planInfo?.limits.maxFavoriteMembers || 5;
    
    // 使用率計算（無制限の場合は0）
    const memberUsageRatio = memberLimit === -1 ? 0 : Math.min(currentMembers / memberLimit, 1);
    const searchUsageRatio = searchLimit === -1 ? 0 : Math.min(currentSearches / searchLimit, 1);
    const historyUsageRatio = historyLimit === -1 ? 0 : Math.min(currentHistory / historyLimit, 1);
    const favoriteUsageRatio = favoriteLimit === -1 ? 0 : Math.min(currentFavorites / favoriteLimit, 1);
    
    // 制限チェック
    const memberAccess = canAddMember(currentMembers);
    const searchAccess = canPerformSearch(currentSearches);
    const historyAccess = canSaveHistory(currentHistory);
    const favoriteAccess = canAddFavoriteMember(currentFavorites);
    const exportAccess = canExportResults();
    const advancedFiltersAccess = canUseAdvancedFilters();
    const teamFeaturesAccess = canUseTeamFeatures();
    
    // 警告表示の判定
    const showUsageWarning = 
      memberUsageRatio > 0.8 || 
      searchUsageRatio > 0.8 || 
      historyUsageRatio > 0.8 || 
      favoriteUsageRatio > 0.8;
    
    const showUpgradePrompt = 
      !memberAccess.canUseFeature || 
      !searchAccess.canUseFeature || 
      !historyAccess.canUseFeature || 
      !favoriteAccess.canUseFeature;

    return {
      // メンバー関連
      canAddNewMember: memberAccess.canUseFeature,
      canRemoveMember: true, // 削除は常に可能
      canAddToFavorites: favoriteAccess.canUseFeature,
      maxMembersReached: !memberAccess.canUseFeature,
      maxFavoritesReached: !favoriteAccess.canUseFeature,
      
      // 検索関連
      canPerformSearch: searchAccess.canUseFeature,
      canSaveSearchHistory: historyAccess.canUseFeature,
      searchLimitReached: !searchAccess.canUseFeature,
      historyLimitReached: !historyAccess.canUseFeature,
      
      // エクスポート関連
      canExportResults: exportAccess.canUseFeature,
      canExportToCsv: currentPlan !== 'free',
      canExportToPdf: currentPlan !== 'free',
      
      // 高度な機能
      canUseAdvancedFilters: advancedFiltersAccess.canUseFeature,
      canUseTeamFeatures: teamFeaturesAccess.canUseFeature,
      canAccessAnalytics: currentPlan !== 'free',
      
      // UI表示制御
      showUpgradePrompt,
      showUsageWarning,
      showTrialBanner: isTrialActive,
      
      // 制限値
      memberLimit,
      searchLimit,
      historyLimit,
      favoriteLimit,
      
      // 現在の使用量
      currentMembers,
      currentSearches,
      currentHistory,
      currentFavorites,
      
      // 使用率
      memberUsageRatio,
      searchUsageRatio,
      historyUsageRatio,
      favoriteUsageRatio,
    };
  }, [
    currentPlan,
    usageStats,
    isTrialActive,
    settings,
    teamMembers,
    planInfo,
    canAddMember,
    canPerformSearch,
    canSaveHistory,
    canAddFavoriteMember,
    canExportResults,
    canUseAdvancedFilters,
    canUseTeamFeatures,
  ]);
}