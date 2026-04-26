import { trpc } from "@/providers/trpc";
import { useAuth } from "./useAuth";
import { useMemo } from "react";

export function useSubscription() {
  const { isAuthenticated } = useAuth();
  const { data, isLoading } = trpc.subscription.myTier.useQuery(undefined, {
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  const tier = data?.tier ?? "free";

  return useMemo(
    () => ({
      tier,
      isLoading,
      isPro: tier === "pro" || tier === "analyst",
      isAnalyst: tier === "analyst",
      isFree: tier === "free",
      canAccessNarratives: tier === "pro" || tier === "analyst",
      canAccessStudio: tier === "analyst",
      canAccessLineMovement: tier === "pro" || tier === "analyst",
      canAccessSchemeAnalysis: tier === "pro" || tier === "analyst",
    }),
    [tier, isLoading],
  );
}
