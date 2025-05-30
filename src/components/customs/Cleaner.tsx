"use client";
import { useBlacklistedDeveloperFilterStore } from "@/stores/cosmo/use-blacklisted-developer-filter.store";
import { useCosmoListsStore } from "@/stores/cosmo/use-cosmo-lists.store";
import { useSearchFilterStore } from "@/stores/cosmo/use-search-filter.store";
import { useTradesTableSettingStore } from "@/stores/table/token/use-trades-table-setting.store";
import { useReferralHistoryTableSettingStore } from "@/stores/table/use-referral-history-table-setting.store";
import { useCurrentTokenChartPriceStore } from "@/stores/token/use-current-token-chart-price.store";
import { useCurrentTokenDeveloperTradesStore } from "@/stores/token/use-current-token-developer-trades";
import { useFilteredWalletTradesStore } from "@/stores/token/use-filtered-wallet-trades";
import { useMatchWalletTrackerTradesStore } from "@/stores/token/use-match-wallet-tracker-trades";
import { useTokenCardsFilter } from "@/stores/token/use-token-cards-filter.store";
import { useTokenHoldingStore } from "@/stores/token/use-token-holding.store";
import { useTokenMessageStore } from "@/stores/token/use-token-messages.store";
import { useTokenSelectedWalletStore } from "@/stores/token/use-token-selected-wallet.store";
import { useTradesWalletModalStore } from "@/stores/token/use-trades-wallet-modal.store";
import { usePnLModalStore } from "@/stores/use-pnl-modal.store";
import { useReferralStore } from "@/stores/use-referral.store";
import { usePathname } from "next/navigation";
import React, { useEffect, useRef } from "react";

function clearMemory() {
  if (window.gc) {
    try {
      window.gc();
    } catch (e) {
      console.warn("Manual GC failed:", e);
    }
  }

  // Clear localStorage items that might accumulate
  const keysToClean = [
    // 'chart_interval_resolution',
    // 'chart_currency',
    // 'chart_type',
    // 'current_solana_price',
    "walletconnect",
    "wagmi.cache",
    "wagmi.connected",
    "wagmi.store",
  ];

  keysToClean.forEach((key) => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn(`Failed to remove localStorage key ${key}:`, e);
    }
  });
}

const Cleaner = () => {
  const pathname = usePathname();
  const cleanupTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const navigationCountRef = useRef<number>(0);
  const lastPathnameRef = useRef<string | null>(pathname);

  // Zustand store cleanup
  const PnLCleanup = usePnLModalStore((state) => state.cleanup);
  const referralCleanup = useReferralStore((state) => state.cleanup);
  const tradesWalletModalCleanup = useTradesWalletModalStore(
    (state) => state.cleanup,
  );
  const tokenSelectedWalletCleanup = useTokenSelectedWalletStore(
    (state) => state.cleanup,
  );
  const tokenMessageCleanup = useTokenMessageStore((state) => state.cleanup);
  const tokenHoldingCleanup = useTokenHoldingStore((state) => state.cleanup);
  const tokenCardsFilterCleanup = useTokenCardsFilter(
    (state) => state.resetFilters,
  );
  const matchWalletTrackerTradesCleanup = useMatchWalletTrackerTradesStore(
    (state) => state.resetMatchWalletTrackerTrades,
  );
  const filterWalletTradesCleanup = useFilteredWalletTradesStore(
    (state) => state.cleanup,
  );
  const currentTokenDeveloperTradesCleanup =
    useCurrentTokenDeveloperTradesStore(
      (state) => state.resetCurrentTokenDeveloperTradesState,
    );
  const currentTokenChartPriceCleanup = useCurrentTokenChartPriceStore(
    (state) => state.cleanup,
  );
  const referralHistoryTableSettingCleanup =
    useReferralHistoryTableSettingStore((state) => state.cleanup);
  const tradesTableSettingCleanup = useTradesTableSettingStore(
    (state) => state.cleanup,
  );
  const searchFilterCleanup = useSearchFilterStore(
    (state) => state.clearAllSearchTerms,
  );
  const cosmoListCleanup = useCosmoListsStore((state) => state.cleanup);
  const blacklistedDeveloperFilterCleanup = useBlacklistedDeveloperFilterStore(
    (state) => state.cleanup,
  );
  // Clear Zustand stores or any other global state here
  useEffect(() => {
    const cleanupStores = () => {
      // Track navigation
      if (pathname !== lastPathnameRef.current) {
        navigationCountRef.current++;
        lastPathnameRef.current = pathname;

        // Force cleanup after 5 page navigations
        if (navigationCountRef.current >= 5) {
          PnLCleanup();
          referralCleanup();
          tradesWalletModalCleanup();
          tokenSelectedWalletCleanup();
          tokenMessageCleanup();
          tokenHoldingCleanup();
          tokenCardsFilterCleanup();
          matchWalletTrackerTradesCleanup();
          filterWalletTradesCleanup();
          currentTokenDeveloperTradesCleanup();
          currentTokenChartPriceCleanup();
          referralHistoryTableSettingCleanup();
          tradesTableSettingCleanup();
          searchFilterCleanup();
          cosmoListCleanup();
          blacklistedDeveloperFilterCleanup();

          clearMemory();
          navigationCountRef.current = 0;
          return;
        }
      }

      // Normal cleanup behavior for regular navigation
      if (cleanupTimeoutRef.current) {
        clearTimeout(cleanupTimeoutRef.current);
      }
      cleanupTimeoutRef.current = setTimeout(() => {
        PnLCleanup();
        referralCleanup();
        tradesWalletModalCleanup();
        tokenSelectedWalletCleanup();
        tokenMessageCleanup();
        tokenHoldingCleanup();
        tokenCardsFilterCleanup();
        matchWalletTrackerTradesCleanup();
        filterWalletTradesCleanup();
        currentTokenDeveloperTradesCleanup();
        currentTokenChartPriceCleanup();
        referralHistoryTableSettingCleanup();
        tradesTableSettingCleanup();
        searchFilterCleanup();
        cosmoListCleanup();
        blacklistedDeveloperFilterCleanup();
      }, 100);
    };

    cleanupStores();

    return () => {
      if (cleanupTimeoutRef.current) {
        clearTimeout(cleanupTimeoutRef.current);
      }
      cleanupStores();
    };
  }, [pathname]);

  // Memory cleanup
  useEffect(() => {
    // Initial cleanup
    clearMemory();

    // Set up interval for periodic cleanup
    const cleanupInterval = setInterval(() => {
      if (navigationCountRef.current >= 5) {
        clearMemory();
        navigationCountRef.current = 0;
      }
    }, 10000);

    // Listen for visibility change to run cleanup when tab becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        clearMemory();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(cleanupInterval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearMemory();
    };
  }, []);

  // Add route change cleanup
  useEffect(() => {
    const cleanup = () => {
      clearMemory();
    };

    window.addEventListener("popstate", cleanup);
    window.addEventListener("beforeunload", cleanup);

    return () => {
      window.removeEventListener("popstate", cleanup);
      window.removeEventListener("beforeunload", cleanup);
    };
  }, []);

  return null;
};

export default React.memo(Cleaner);
