'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { PLAN_CONFIG } from '@cezar12/shared/constants';
import type { SubscriptionPlan } from '@cezar12/shared';

interface Permissions {
  canUseKitchenIntelligence: boolean;
  canUseDailyRecommendations: boolean;
  canUseAdvancedServices: boolean;
  canUseIntegratedPlanWithFollowup: boolean;
  canUseAPIAccess: boolean;
  maxProjects: number;
  plan: SubscriptionPlan | null;
  tokensRemaining: number;

  // Service-specific permissions
  canUseMarketResearch: boolean;
  canUseAdCampaigns: boolean;
  canUseSEO: boolean;
  canUseLeadGeneration: boolean;

  // Token checks
  hasEnoughTokens: (cost: number) => boolean;
}

export function usePermissions(): Permissions {
  const subscription = useAuthStore((s) => s.subscription);
  const tokenBalance = useAuthStore((s) => s.tokenBalance);

  const plan = subscription?.plan ?? null;
  const tokensRemaining = tokenBalance?.total_available ?? 0;

  const isGoldOrHigher = plan === 'gold' || plan === 'platinum';
  const isPlatinum = plan === 'platinum';

  const maxProjects =
    plan === null
      ? 0
      : plan === 'silver'
        ? PLAN_CONFIG.silver.maxProjects
        : plan === 'gold'
          ? PLAN_CONFIG.gold.maxProjects
          : Infinity;

  return {
    canUseKitchenIntelligence: isGoldOrHigher,
    canUseDailyRecommendations: isGoldOrHigher,
    canUseAdvancedServices: isGoldOrHigher,
    canUseIntegratedPlanWithFollowup: isPlatinum,
    canUseAPIAccess: isPlatinum,
    maxProjects,
    plan,
    tokensRemaining,

    // Advanced services (Gold+)
    canUseMarketResearch: isGoldOrHigher,
    canUseAdCampaigns: isGoldOrHigher,
    canUseSEO: isGoldOrHigher,
    canUseLeadGeneration: isGoldOrHigher,

    hasEnoughTokens: (cost: number) => tokensRemaining >= cost,
  };
}
