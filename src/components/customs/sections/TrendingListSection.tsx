"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useDexesFilterStore } from "@/stores/dex-setting/use-dexes-filter.store";
import { useMoreFilterStore } from "@/stores/dex-setting/use-more-filter.store";
import { useActiveTrendingTimeStore } from "@/stores/dex-setting/use-active-trending-time-preset.store";
import { useUserInfoStore } from "@/stores/user/use-user-info.store";
import { useQuery } from "@tanstack/react-query";
// ######## APIs 🛜 ########
import { getTrendingFetch } from "@/apis/rest/trending";
// ######## Components 🧩 ########
import TrendingTable from "@/components/customs/tables/TrendingTable";
import TrendingListMobile from "@/components/customs/lists/mobile/TrendingListMobile";
import EmptyState from "@/components/customs/EmptyState";
import TrendingCardLoading from "@/components/customs/loadings/TrendingCardLoading";
import TrendingCardMobileLoading from "@/components/customs/loadings/TrendingCardMobileLoading";
import { Skeleton } from "@/components/ui/skeleton";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
// ######## Types 🗨️ ########
import { TrendingDataMessageType } from "@/types/ws-general";
// ######## Constants ☑️ ########
import { dummyTrendingData } from "@/constants/dummy-data";
import { usePopupStore } from "@/stores/use-popup-state";
import { cn } from "@/libraries/utils";
import { useTrackedWalletsOfToken } from "@/hooks/use-tracked-wallets-of-token";

type TrendingListSectionProps = {
  list: TrendingDataMessageType[];
  isLoading?: boolean;
};

export default function TrendingListSection({
  list,
  isLoading,
}: TrendingListSectionProps) {
  const { walletsOfToken } = useTrackedWalletsOfToken();

  const isTrendingTutorial = useUserInfoStore(
    (state) => state.isTrendingTutorial,
  );

  // Filter Configuration ✨
  const activeTrendingTime = useActiveTrendingTimeStore(
    (state) => state.activeTrendingTime,
  );

  const DEXFilter = useDexesFilterStore(
    (state) => state.filters.genuine.checkBoxes,
  );
  const {
    showKeywords,
    checkBoxes,
    byCurrentLiquidity,
    byVolume,
    byAge,
    byMarketCap,
    byTXNS,
    byBuys,
    bySells,
  } = useMoreFilterStore((state) => state.filters.genuine);

  const isFilterApplied = useMemo(() => {
    const hasMinMaxFilter = (filter: {
      min: number | undefined;
      max: number | undefined;
    }) => filter.min !== undefined || filter.max !== undefined;

    return (
      DEXFilter.moonshot === false ||
      DEXFilter.pumpfun === false ||
      DEXFilter.launchlab === false ||
      DEXFilter.dynamic_bonding_curve === false ||
      // DEXFilter.believe === false ||
      DEXFilter.bonk === false ||
      DEXFilter.raydium === false ||
      DEXFilter.meteora_amm_v2 === false ||
      DEXFilter.meteora_amm === false ||
      DEXFilter.pumpswap === false ||
      showKeywords !== "" ||
      checkBoxes.mintAuth === true ||
      checkBoxes.freezeAuth === true ||
      checkBoxes.onlyLPBurned === true ||
      checkBoxes.top10Holders === true ||
      checkBoxes.hideBundled === true ||
      checkBoxes.withAtLeast1Social === true ||
      hasMinMaxFilter(byCurrentLiquidity) ||
      hasMinMaxFilter(byVolume) ||
      hasMinMaxFilter(byAge) ||
      hasMinMaxFilter(byMarketCap) ||
      hasMinMaxFilter(byTXNS) ||
      hasMinMaxFilter(byBuys) ||
      hasMinMaxFilter(bySells)
    );
  }, [
    DEXFilter.moonshot,
    DEXFilter.pumpfun,
    DEXFilter.launchlab,
    DEXFilter.dynamic_bonding_curve,
    // DEXFilter.believe,
    DEXFilter.bonk,
    DEXFilter.raydium,
    DEXFilter.meteora_amm_v2,
    DEXFilter.meteora_amm,
    DEXFilter.pumpswap,
    showKeywords,
    checkBoxes.mintAuth,
    checkBoxes.freezeAuth,
    checkBoxes.onlyLPBurned,
    checkBoxes.hideBundled,
    checkBoxes.withAtLeast1Social,
    byCurrentLiquidity.min,
    byCurrentLiquidity.max,
    byVolume.min,
    byVolume.max,
    byAge.min,
    byAge.max,
    byMarketCap.min,
    byMarketCap.max,
    byTXNS.min,
    byTXNS.max,
    byBuys.min,
    byBuys.max,
    bySells.min,
    bySells.max,
  ]);

  // Filter Fetch 🛜
  const fetchCount = useRef(0);
  const [filterFetchList, setFilterFetchList] = useState<
    TrendingDataMessageType[]
  >([]);
  const isLoadingFilterFetch = useMoreFilterStore(
    (state) => state.isLoadingFilterFetch,
  );
  const setIsLoadingFilterFetch = useMoreFilterStore(
    (state) => state.setIsLoadingFilterFetch,
  );
  const fetchFilterData = async () => {
    fetchCount.current++;
    if (fetchCount.current !== 1) return [];

    try {
      const dexes = Object.entries(DEXFilter)
        .filter(([key, value]) => value === true)
        .map(([key]) => {
          if (key === "pumpfun") {
            return "Pump.Fun";
          }
          if (key === "pumpswap") {
            return "Pump.Swap";
          }
          if (key === "launchlab") {
            return "LaunchLab";
          }
          if (key === "dynamic_bonding_curve") {
            return "Dynamic Bonding Curve";
          }
          if (key === "meteora_amm_v2") {
            return "Meteora AMM V2";
          }
          if (key === "meteora_amm") {
            return "Meteora AMM";
          }
          return key
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join("");
        })
        .join(",");

      const data = await getTrendingFetch({
        dexes: dexes,
        show_keywords: showKeywords,
        mint_disabled: checkBoxes.mintAuth,
        freeze_disabled: checkBoxes.freezeAuth,
        lp_burned: checkBoxes.onlyLPBurned,
        hide_bundled: checkBoxes.hideBundled,
        one_social: checkBoxes.withAtLeast1Social,
        min_age: byAge?.min,
        max_age: byAge?.max,
        min_liquidity: byCurrentLiquidity?.min,
        max_liquidity: byCurrentLiquidity?.max,
        min_market_cap: byMarketCap?.min,
        max_market_cap: byMarketCap?.max,
        min_volume: byVolume?.min,
        max_volume: byVolume?.max,
        min_transactions: byTXNS?.min,
        max_transactions: byTXNS?.max,
        min_buys: byBuys?.min,
        max_buys: byBuys?.max,
        min_sells: bySells?.min,
        max_sells: bySells?.max,
        interval: activeTrendingTime.toLowerCase() as
          | "1m"
          | "5m"
          | "30m"
          | "1h",
      });

      if (data?.length > 0) {
        setFilterFetchList(data);
        return data;
      } else {
        setFilterFetchList([]);
        return [];
      }
    } catch (error) {
      console.warn("Error fetching filter data:", error);
      return [];
    } finally {
      setIsLoadingFilterFetch(false);
      fetchCount.current = 0;
    }
  };

  useQuery({
    queryKey: ["trendingFilterFetch", isLoadingFilterFetch],
    queryFn: fetchFilterData,
    enabled:
      (isLoadingFilterFetch || isFilterApplied) && fetchCount.current === 0,
  });

  // Filters 🔍
  const filterTokens = useCallback(
    (data: TrendingDataMessageType) => {
      // ### DEX FILTER
      // const transformedDex = data?.dex.replace(".", "").toLowerCase();
      // if (!DEXFilter[transformedDex as keyof typeof DEXFilter]) return false;

      // ### DEX FILTER
      const launchpadDex = data?.launchpad
        ?.replace(/\./g, "")
        ?.replace(/ /g, "_")
        ?.toLowerCase();
      const transformedDex = data?.dex
        ?.replace(/\./g, "")
        ?.replace(/ /g, "_")
        ?.toLowerCase();

      if (
        !(
          (launchpadDex && DEXFilter[launchpadDex as keyof typeof DEXFilter]) ||
          (transformedDex &&
            DEXFilter[transformedDex as keyof typeof DEXFilter])
        )
      ) {
        return false;
      }

      // // ### KEYWORDS FILTER
      if (showKeywords) {
        const keywords = showKeywords
          .toLowerCase()
          .split(",")
          .map((k) => k.trim());
        const tokenText = `${data.name} ${data.symbol}`.toLowerCase();
        if (!keywords.some((keyword) => tokenText.includes(keyword)))
          return false;
      }

      // ### AUDIT RESULTS FILTER
      if (checkBoxes.mintAuth) {
        if (!data.mint_disabled) return false;
      }
      if (checkBoxes.freezeAuth) {
        if (!data.freeze_disabled) return false;
      }
      if (checkBoxes.onlyLPBurned) {
        if (!data.burned) return false;
      }
      if (checkBoxes.top10Holders) {
        if (data.top10 > 15) return false;
      }
      if (checkBoxes.hideBundled) {
        if (data.bundled) return false;
      }

      // ### SOCIALS COUNT FILTER
      if (checkBoxes.withAtLeast1Social) {
        const socials = [data.telegram, data.twitter, data.website];

        if (socials.length === 0) return false;
      }

      // ### AMOUNT FILTER
      // 1. Current Liquidity Filter
      if (byCurrentLiquidity.min && data.liquidity_usd < byCurrentLiquidity.min)
        return false;
      if (byCurrentLiquidity.max && data.liquidity_usd > byCurrentLiquidity.max)
        return false;

      // // 2. Volume Filter
      if (byVolume.min && data.volume_usd < byVolume.min) return false;
      if (byVolume.max && data.volume_usd > byVolume.max) return false;

      // 3. Age Filter (created timestamp)
      const now = Math.floor(Date.now());
      const ageInMins = (now - data.created) / (1000 * 60);
      if (byAge.min && ageInMins < byAge.min) return false;
      if (byAge.max && ageInMins > byAge.max) return false;

      // 4. Market Cap Filter
      if (byMarketCap.min && data.market_cap_usd < byMarketCap.min)
        return false;
      if (byMarketCap.max && data.market_cap_usd > byMarketCap.max)
        return false;

      // 5. Transactions Filter
      const TXNS = data.buys + data.sells;
      if (byTXNS.min && TXNS < byTXNS.min) return false;
      if (byTXNS.max && TXNS > byTXNS.max) return false;

      // 6. Buys Filter
      if (byBuys.min && data.buys < byBuys.min) return false;
      if (byBuys.max && data.buys > byBuys.max) return false;

      // 7. Sells Filter
      if (bySells.min && data.sells < bySells.min) return false;
      if (bySells.max && data.sells > bySells.max) return false;

      return true;
    },
    [
      DEXFilter,
      showKeywords,
      checkBoxes,
      byCurrentLiquidity,
      byVolume,
      byAge,
      byMarketCap,
      byTXNS,
      byBuys,
      bySells,
    ],
  );

  const sortedAndFilteredList = useMemo(() => {
    if (isTrendingTutorial) {
      return dummyTrendingData;
    }

    const sourceList = isFilterApplied ? filterFetchList : list;
    /* console.log("sourceList", sourceList) */;

    return sourceList.filter(filterTokens);
  }, [
    isFilterApplied,
    filterFetchList,
    list,
    isTrendingTutorial,
    filterTokens,
  ]);

  useEffect(() => {
    setFilterFetchList((prevList) => {
      const newList = list.map((item) => {
        const updatedItem = prevList.find(
          (prevItem) => prevItem.mint === item.mint,
        );
        return updatedItem ? { ...updatedItem, ...item } : item;
      });
      return newList;
    });
  }, [list]);

  const { remainingScreenWidth } = usePopupStore();

  /* console.log("sortedAndFilteredList", sortedAndFilteredList) */;

  return (
    <>
      {/* Desktop */}
      {(isLoading || isLoadingFilterFetch) && !isTrendingTutorial ? (
        <TrendingListSectionLoading variant="desktop" />
      ) : (
        <>
          {isFilterApplied || activeTrendingTime ? (
            sortedAndFilteredList.length > 0 ? (
              <div
                className={cn(
                  "relative mb-12 w-full flex-grow grid-cols-1",
                  remainingScreenWidth >= 1280 ? "grid" : "hidden",
                )}
              >
                <TrendingTable
                  list={sortedAndFilteredList}
                  trackedWalletsOfToken={walletsOfToken}
                />
              </div>
            ) : (
              <div
                className={cn(
                  "mb-12 w-full flex-grow flex-col items-center justify-center bg-[#080811]",
                  remainingScreenWidth >= 1024 ? "flex" : "hidden",
                )}
              >
                <EmptyState state="No Result" />
              </div>
            )
          ) : (
            <div
              className={cn(
                "relative mb-12 w-full flex-grow grid-cols-1",
                remainingScreenWidth >= 1280 ? "grid" : "hidden",
              )}
            >
              <TrendingTable
                list={sortedAndFilteredList}
                trackedWalletsOfToken={walletsOfToken}
              />
            </div>
          )}
        </>
      )}
      {/* Mobile */}
      {(isLoading || isLoadingFilterFetch) && !isTrendingTutorial ? (
        <TrendingListSectionLoading variant="mobile" />
      ) : (
        <>
          {isFilterApplied || activeTrendingTime ? (
            sortedAndFilteredList.length > 0 ? (
              <div
                className={cn(
                  "relative mb-3.5 w-full flex-grow grid-cols-1",
                  remainingScreenWidth >= 1280 ? "hidden" : "flex",
                )}
              >
                <TrendingListMobile
                  list={sortedAndFilteredList}
                  trackedWalletsOfToken={walletsOfToken}
                />
              </div>
            ) : (
              <div
                className={cn(
                  "mb-12 w-full flex-grow flex-col items-center justify-center",
                  remainingScreenWidth >= 1024 ? "hidden" : "flex",
                )}
              >
                <EmptyState state="No Result" />
              </div>
            )
          ) : (
            <div
              className={cn(
                "relative mb-3.5 w-full flex-grow grid-cols-1",
                remainingScreenWidth >= 1280 ? "hidden" : "flex",
              )}
            >
              <TrendingListMobile
                list={sortedAndFilteredList}
                trackedWalletsOfToken={walletsOfToken}
              />
            </div>
          )}
        </>
      )}
    </>
  );
}

const TrendingListSectionLoading = ({
  variant,
}: {
  variant: "desktop" | "mobile";
}) => {
  return variant === "desktop" ? (
    <div className="relative mb-12 hidden w-full flex-grow grid-cols-1 xl:grid">
      <div className="hidden w-full flex-grow flex-col overflow-hidden rounded-[8px] border border-border lg:flex">
        <OverlayScrollbarsComponent
          defer
          element="div"
          className="invisible__overlayscrollbar relative w-full flex-grow overflow-y-scroll"
        >
          <div className="absolute left-0 top-0 flex w-full flex-grow flex-col">
            <div className="flex h-10 min-w-max items-center border-b border-border">
              <div className="flex w-full min-w-[248px] items-center p-3">
                <Skeleton className="h-4 w-full bg-gradient-to-r" />
              </div>
              <div className="flex w-full min-w-[165px] items-center p-3">
                <Skeleton className="h-4 w-full bg-gradient-to-r" />
              </div>
              <div className="flex w-full min-w-[165px] items-center p-3">
                <Skeleton className="h-4 w-full bg-gradient-to-r" />
              </div>
              <div className="flex w-full min-w-[165px] items-center p-3">
                <Skeleton className="h-4 w-full bg-gradient-to-r" />
              </div>
              <div className="flex w-full min-w-[165px] items-center p-3">
                <Skeleton className="h-4 w-full bg-gradient-to-r" />
              </div>
              <div className="flex w-full min-w-[165px] items-center p-3">
                <Skeleton className="h-4 w-full bg-gradient-to-r" />
              </div>
              <div className="flex w-full min-w-[165px] items-center p-3">
                <Skeleton className="h-4 w-full bg-gradient-to-r" />
              </div>
              <div className="flex w-full min-w-[165px] items-center p-3">
                <Skeleton className="h-4 w-full bg-gradient-to-r" />
              </div>
            </div>

            <div className="flex h-auto w-full flex-col">
              {Array.from({ length: 30 }).map((_, index) => (
                <TrendingCardLoading key={index} />
              ))}
            </div>
          </div>
        </OverlayScrollbarsComponent>
      </div>
    </div>
  ) : (
    <div className="relative mb-3.5 flex w-full flex-grow grid-cols-1 xl:hidden">
      <div className="flex w-full flex-grow flex-col pl-4 pr-1 lg:hidden lg:pl-0">
        <OverlayScrollbarsComponent
          defer
          element="div"
          className="trending__overlayscrollbar relative w-full flex-grow overflow-y-scroll"
        >
          <div className="absolute left-0 top-0 flex w-full flex-grow flex-col pb-10 pr-4">
            <div className="flex h-auto w-full flex-col gap-y-2">
              {Array.from({ length: 10 }).map((_, index) => (
                <TrendingCardMobileLoading key={index} />
              ))}
            </div>
          </div>
        </OverlayScrollbarsComponent>
      </div>
    </div>
  );
};
