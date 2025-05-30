"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  ChangeEvent,
} from "react";
import { useGraduatedFilterStore } from "@/stores/cosmo/use-graduated-filter.store";
import { useCosmoListsStore } from "@/stores/cosmo/use-cosmo-lists.store";
import { useUserInfoStore } from "@/stores/user/use-user-info.store";
import { useBlacklistedDeveloperFilterStore } from "@/stores/cosmo/use-blacklisted-developer-filter.store";
import { useAnnouncementStore } from "@/stores/use-announcement.store";
// ######## Components 🧩 ########
import Image from "next/image";
import Separator from "@/components/customs/Separator";
import GraduatedListFilterPopover from "@/components/customs/popovers/GraduatedListFilterPopover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import CosmoCardLoading from "@/components/customs/loadings/CosmoCardLoading";
import EmptyState from "@/components/customs/EmptyState";
// ######## Types 🗨️ ########
import { CosmoDataMessageType } from "@/types/ws-general";
import { deduplicateAndPrioritizeLatestData_CosmoData } from "@/helpers/deduplicateAndPrioritizeLatestData";
import { Input } from "@/components/ui/input";
import { useSearchFilterStore } from "@/stores/cosmo/use-search-filter.store";
import { useHiddenTokensStore } from "@/stores/cosmo/use-hidden-tokens.store";
import { CachedImage } from "../CachedImage";
import debounce from "lodash/debounce";
import dynamic from "next/dynamic";
import { usePopupStore } from "@/stores/use-popup-state";
import { cn } from "@/libraries/utils";
import VirtualizedCosmoCard from "../cards/VirtualizedCosmoCard";
import CosmoCard from "../cards/CosmoCard";
import VirtualizedContainer from "../virtualization/VirtualizedContainer";
import { CosmoFilterSubscribeMessageType } from "@/types/ws-general";
import { formatAmountDollar } from "@/utils/formatAmount";
import convertCosmoIntoWSFilterFormat from "@/utils/convertCosmoIntoWSFilterFormat";
import CosmoCardRow from "../cards/VirtualizedCosmoCard";
import { FixedSizeList } from "react-window";
import { presetPriority, setHeight } from "./NewlyCreatedList";
import { useCustomizeSettingsStore } from "@/stores/setting/use-customize-settings.store";
import { AvatarSetting } from "@/apis/rest/settings/settings";
import { useSnapStateStore } from "@/stores/use-snap-state";
import { useCopyDropdownState } from "@/stores/cosmo/card-state/use-copy-dropdown-state.store";
import { CosmoSound } from "@/components/customs/popovers/CosmoSound";
import { Search, ShieldCloseIcon, X } from "lucide-react";
import BaseButton from "../buttons/BaseButton";
import { motion } from "framer-motion";
import QuickAmountInput from "@/components/customs/QuickAmountInput";
import { useTokenStateAmountStore } from "@/stores/dex-setting/use-token-state-amount.store";

export type GraduatedListProps = {
  sizeVariant: "desktop" | "mobile";
  isLoading: boolean;
  trackedWalletsOfToken: Record<string, string[]>;
  handleSendFilterMessage: (
    category: "created" | "aboutToGraduate" | "graduated",
    filterObject: CosmoFilterSubscribeMessageType,
  ) => void;
};

type TokenState = "newlyCreated" | "aboutToGraduate" | "graduated";

export default function GraduatedList({
  sizeVariant,
  isLoading,
  trackedWalletsOfToken,
  handleSendFilterMessage,
}: GraduatedListProps) {
  const isAnnouncementExist = useAnnouncementStore(
    (state) => state.isAnnouncementExist,
  );

  const isCosmoTutorial = useUserInfoStore((state) => state.isCosmoTutorial);
  const remainingScreenWidth = usePopupStore(
    (state) => state.remainingScreenWidth,
  );

  // Add dropdown state
  const isAnyDropdownOpen = useCopyDropdownState(
    (state) => state.isAnyDropdownOpen,
  );

  const graduatedList = useCosmoListsStore((state) => state.graduatedList);
  const [filterFetchList, setFilterFetchListState] = useState<
    CosmoDataMessageType[]
  >([]);

  // Filter & Hovered Configuration ✨
  const [isListHovered, setIsListHovered] = useState(false);
  const {
    checkBoxes,
    showKeywords,
    doNotShowKeywords,
    byHoldersCount,
    byTop10Holders,
    byDevHoldingPercentage,
    byDevMigrated,
    bySnipers,
    byInsiderHoldingPercentage,
    byBotHolders,
    byAge,
    byCurrentLiquidity,
    byVolume,
    byMarketCap,
    byTXNS,
    byBuys,
    bySells,
  } = useGraduatedFilterStore((state) => state.filters.genuine);

  const hiddenTokens = useHiddenTokensStore((state) => state.hiddenTokens);

  const isFilterApplied = useMemo(() => {
    const hasMinMaxFilter = (filter: {
      min: number | undefined;
      max: number | undefined;
    }) => filter?.min !== undefined || filter?.max !== undefined;
    return (
      checkBoxes.moonshot === false ||
      checkBoxes.pumpfun === false ||
      checkBoxes.dynamic_bonding_curve === false ||
      checkBoxes.launch_a_coin === false ||
      checkBoxes.bonk === false ||
      checkBoxes.launchlab === false ||
      checkBoxes.showHide === true ||
      showKeywords !== "" ||
      doNotShowKeywords !== "" ||
      hasMinMaxFilter(byHoldersCount) ||
      hasMinMaxFilter(byTop10Holders) ||
      hasMinMaxFilter(byDevHoldingPercentage) ||
      hasMinMaxFilter(byDevMigrated) ||
      hasMinMaxFilter(bySnipers) ||
      hasMinMaxFilter(byInsiderHoldingPercentage) ||
      hasMinMaxFilter(byBotHolders) ||
      hasMinMaxFilter(byAge) ||
      hasMinMaxFilter(byCurrentLiquidity) ||
      hasMinMaxFilter(byVolume) ||
      hasMinMaxFilter(byMarketCap) ||
      hasMinMaxFilter(byTXNS) ||
      hasMinMaxFilter(byBuys) ||
      hasMinMaxFilter(bySells)
    );
  }, [
    checkBoxes.moonshot,
    checkBoxes.pumpfun,
    checkBoxes.dynamic_bonding_curve,
    checkBoxes.launch_a_coin,
    checkBoxes.bonk,
    checkBoxes.launchlab,
    checkBoxes.showHide,
    showKeywords,
    doNotShowKeywords,
    byHoldersCount,
    byTop10Holders,
    byDevHoldingPercentage,
    byDevMigrated,
    bySnipers,
    byInsiderHoldingPercentage,
    byBotHolders,
    byAge,
    byCurrentLiquidity,
    byVolume,
    byMarketCap,
    byTXNS,
    byBuys,
    bySells,
  ]);

  const isLoadingFilterFetch = useGraduatedFilterStore(
    (state) => state.isLoadingFilterFetch,
  );
  const setIsLoadingFilterFetch = useGraduatedFilterStore(
    (state) => state.setIsLoadingFilterFetch,
  );
  useEffect(() => {
    if (isLoadingFilterFetch) {
      const timeout = setTimeout(() => {
        setIsLoadingFilterFetch(false);
        clearTimeout(timeout);
      }, 400);
    }
  }, [isLoadingFilterFetch, setIsLoadingFilterFetch]);

  const filterTokens = useCallback(
    (data: CosmoDataMessageType) => {
      if (
        data.dex === "Pump.Fun" ||
        data.dex === "Moonshot" ||
        data.dex === "LaunchLab" ||
        data.dex === "Dynamic Bonding Curve" ||
        data.dex === "Boop"
      ) {
        return false;
      }

      // // ### DEX FILTER
      // const transformedOriginDex = data?.origin_dex
      //   ?.replace(/\./g, "")
      //   ?.replace(/ /g, "_")
      //   ?.toLowerCase();
      // const transformedDex = data?.dex
      //   ?.replace(/\./g, "")
      //   ?.replace(/ /g, "_")
      //   ?.toLowerCase();

      // if (
      //   !(
      //     (transformedOriginDex &&
      //       checkBoxes[transformedOriginDex as keyof typeof checkBoxes]) ||
      //     (transformedDex &&
      //       checkBoxes[transformedDex as keyof typeof checkBoxes])
      //   )
      // ) {
      //   return false;
      // }

      // ### DEX FILTER
      const launchpadDex = data?.launchpad
        ?.replace(/\./g, "")
        ?.replace(/ /g, "_")
        ?.toLowerCase();
      const transformedDex = data?.origin_dex
        ?.replace(/\./g, "")
        ?.replace(/ /g, "_")
        ?.toLowerCase();

      if (
        !(
          (launchpadDex &&
            checkBoxes[launchpadDex as keyof typeof checkBoxes]) ||
          (transformedDex &&
            checkBoxes[transformedDex as keyof typeof checkBoxes])
        )
      ) {
        return false;
      }

      // ### KEYWORDS FILTER
      if (showKeywords) {
        const keywords = showKeywords
          .toLowerCase()
          .split(",")
          .map((k) => k.trim());
        const tokenText =
          `${data.name} ${data.symbol} ${data.mint}`.toLowerCase();
        if (!keywords.some((keyword) => tokenText.includes(keyword)))
          return false;
      }

      if (doNotShowKeywords) {
        const keywords = doNotShowKeywords
          .toLowerCase()
          .split(",")
          .map((k) => k.trim());
        const tokenText =
          `${data.name} ${data.symbol} ${data.mint}`.toLowerCase();
        if (keywords.some((keyword) => tokenText.includes(keyword)))
          return false;
      }

      // ### AMOUNT FILTER
      // 1. Holders Count Filter
      const holdersCount = Number(data.holders) || 0;
      if (byHoldersCount?.min && holdersCount < byHoldersCount?.min)
        return false;
      if (byHoldersCount?.max && holdersCount > byHoldersCount?.max)
        return false;

      // 2. Top 10 Holders Filter
      const top10Holders = Number(data.top10_percentage) || 0;
      if (byTop10Holders?.min && top10Holders < byTop10Holders?.min)
        return false;
      if (byTop10Holders?.max && top10Holders > byTop10Holders?.max)
        return false;

      // 3. Dev Holdings Filter
      const devHoldingsPercent = Number(data.dev_holding_percentage) || 0;
      if (
        byDevHoldingPercentage?.min &&
        devHoldingsPercent < byDevHoldingPercentage?.min
      )
        return false;
      if (
        byDevHoldingPercentage?.max &&
        devHoldingsPercent > byDevHoldingPercentage?.max
      )
        return false;

      // 4. Dev Migrated Filter
      const devMigrated = Number(data.snipers) || 0;
      if (byDevMigrated?.min && devMigrated < byDevMigrated?.min) return false;
      if (byDevMigrated?.max && devMigrated > byDevMigrated?.max) return false;

      // 5. Snipers Filter
      const snipers = Number(data.snipers) || 0;
      if (bySnipers?.min && snipers < bySnipers?.min) return false;
      if (bySnipers?.max && snipers > bySnipers?.max) return false;

      // 6. Insider Holding Filter
      const insiderHoldingsPercent = Number(data.insider_percentage) || 0;
      if (
        byInsiderHoldingPercentage?.min &&
        insiderHoldingsPercent < byInsiderHoldingPercentage?.min
      )
        return false;
      if (
        byInsiderHoldingPercentage?.max &&
        insiderHoldingsPercent > byInsiderHoldingPercentage?.max
      )
        return false;

      // 7. Bot Holders Filter
      const botHolders = Number(data.bot_holders) || 0;
      if (byBotHolders?.min && botHolders < byBotHolders?.min) return false;
      if (byBotHolders?.max && botHolders > byBotHolders?.max) return false;

      // 8. Age Filter (Mins)
      const now = Math.floor(Date.now() / 1000); // Current time in seconds
      const migratedTime =
        data.created > 1e12 // Check if timestamp is in ms
          ? Math.floor(data.migrated_time / 1000) // Convert ms to s if needed
          : Number(data.migrated_time) || 0; // Keep as seconds

      const ageInMinutes = (now - migratedTime) / 60;

      if (byAge?.min && ageInMinutes < byAge?.min) return false;
      if (byAge?.max && ageInMinutes > byAge?.max) return false;

      // 9. Current Liquidity Filter
      const currentLiquidity = Number(data.liquidity_usd) || 0;
      if (byCurrentLiquidity?.min && currentLiquidity < byCurrentLiquidity?.min)
        return false;
      if (byCurrentLiquidity?.max && currentLiquidity > byCurrentLiquidity?.max)
        return false;

      // 10. Volume Filter
      const volumeValue = Number(data.volume_usd) || 0;
      if (byVolume?.min && volumeValue < byVolume?.min) return false;
      if (byVolume?.max && volumeValue > byVolume?.max) return false;

      // 11. Market Cap Filter
      const marketCap = Number(data.market_cap_usd) || 0;
      if (byMarketCap?.min && marketCap < byMarketCap?.min) return false;
      if (byMarketCap?.max && marketCap > byMarketCap?.max) return false;

      // 12. TXNS Filter
      const TXNS = (Number(data.buys) || 0) + (Number(data.sells) || 0);
      if (byTXNS?.min && TXNS < byTXNS?.min) return false;
      if (byTXNS?.max && TXNS > byTXNS?.max) return false;

      // 13. Buys Filter
      const buys = Number(data.buys) || 0;
      if (byBuys?.min && buys < byBuys?.min) return false;
      if (byBuys?.max && buys > byBuys?.max) return false;

      // 14. Sells Filter
      const sells = Number(data.sells) || 0;
      if (bySells?.min && sells < bySells?.min) return false;
      if (bySells?.max && sells > bySells?.max) return false;

      return true;
    },
    [
      checkBoxes,
      showKeywords,
      doNotShowKeywords,
      byHoldersCount,
      byTop10Holders,
      byDevHoldingPercentage,
      byDevMigrated,
      bySnipers,
      byInsiderHoldingPercentage,
      byBotHolders,
      byAge,
      byCurrentLiquidity,
      byVolume,
      byMarketCap,
      byTXNS,
      byBuys,
      bySells,
    ],
  );

  const handleApplyFilterAndSendMessage = useCallback(() => {
    const latestGenuineFilters =
      useGraduatedFilterStore.getState().filters.genuine;
    const blacklistDevelopers =
      useBlacklistedDeveloperFilterStore.getState().blacklistedDevelopers;

    const filterObject = convertCosmoIntoWSFilterFormat(
      latestGenuineFilters,
      blacklistDevelopers,
      hiddenTokens?.join(","),
      "graduated",
    );

    handleSendFilterMessage?.("graduated", filterObject);
  }, [handleSendFilterMessage]);

  const [currentMintWhenListHovered, setCurrentMintWhenListHovered] = useState<
    CosmoDataMessageType[]
  >([]);

  useEffect(() => {
    if (isFilterApplied) {
      if (isListHovered) {
        setFilterFetchListState((prev) => {
          const updatesForExisting = graduatedList.filter((latest) =>
            prev.some((existing) => existing?.mint === latest?.mint),
          );

          const updatedList = deduplicateAndPrioritizeLatestData_CosmoData([
            ...prev,
            ...updatesForExisting,
          ]);

          return updatedList.filter(isListHovered ? () => true : filterTokens);
        });
      } else {
        setFilterFetchListState(() => {
          return graduatedList.filter(
            isListHovered ? () => true : filterTokens,
          );
        });
      }
    }
    if (!isListHovered) {
      setCurrentMintWhenListHovered([]);
    }
  }, [graduatedList, isFilterApplied, filterTokens, isListHovered]);

  const filteredList = useMemo(() => {
    const isHidden = checkBoxes.showHide;

    let list = graduatedList;

    if (isFilterApplied) {
      list = filterFetchList;
    } else if (isListHovered) {
      if (currentMintWhenListHovered?.length > 0) {
        const updatesForPaused = graduatedList.filter((latest) =>
          currentMintWhenListHovered.some(
            (existing) => existing?.mint === latest?.mint,
          ),
        );

        list = deduplicateAndPrioritizeLatestData_CosmoData([
          ...currentMintWhenListHovered,
          ...updatesForPaused,
        ]);
      }
    }

    return list
      .filter(isListHovered ? () => true : filterTokens)
      .filter((item) =>
        isHidden
          ? hiddenTokens.includes(item?.mint)
          : !hiddenTokens.includes(item?.mint),
      );
  }, [
    currentMintWhenListHovered,
    graduatedList,
    isListHovered,
    filterFetchList,
    isFilterApplied,
    checkBoxes.showHide,
    hiddenTokens,
    filterTokens,
  ]);

  const handleSetCurrentMintWhenListHovered = useCallback(() => {
    if (isListHovered) return;
    setIsListHovered(true);
    setCurrentMintWhenListHovered(filteredList);
  }, [filteredList]);

  // ########## Search 🔍 ###########
  const setPreviewSearch = useGraduatedFilterStore((s) => s.setPreviewSearch);
  const previewSearchValue = useGraduatedFilterStore(
    (s) => s.filters.preview.showKeywords,
  );
  const applyFilter = useGraduatedFilterStore((s) => s.applyGraduatedFilters);
  const debouncedSetGenuineSearch = useCallback(
    debounce(async () => {
      /* console.log("COSMO DEBOUNCE FILTER ✨ | DHSC") */;
      setIsLoadingFilterFetch(true);
      applyFilter();
      handleApplyFilterAndSendMessage();
    }, 300),
    [applyFilter],
  );
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    /* console.log("COSMO DEBOUNCE FILTER ✨ | HSC") */;
    debouncedSetGenuineSearch();
    setPreviewSearch(query);
  };

  useEffect(() => {
    return () => {
      debouncedSetGenuineSearch.cancel();
      setIsLoadingFilterFetch(false);
      setIsListHovered(false);
      setCurrentMintWhenListHovered([]);
    };
  }, [debouncedSetGenuineSearch]);

  // const isFirstLoad = useRef<boolean | null>(true);
  // useEffect(() => {
  //   if (isFirstLoad.current) {
  //     handleApplyFilterAndSendMessage();
  //     isFirstLoad.current = false;
  //   }

  //   return () => {
  //     isFirstLoad.current = null;
  //   };
  // }, [handleSendFilterMessage, handleApplyFilterAndSendMessage]);

  // const [showList, setShowList] = useState(false);

  // Add ref to track if mouse is currently over the list
  const listRef = useRef<HTMLDivElement>(null);
  const [isMouseOverList, setIsMouseOverList] = useState(false);

  // Watch mouse for dropdown state changes
  useEffect(() => {
    if (!isAnyDropdownOpen && isListHovered) {
      if (!isMouseOverList) {
        setIsListHovered(false);
        setCurrentMintWhenListHovered([]);
      }
    }
  }, [isAnyDropdownOpen, isListHovered, isMouseOverList]);

  const handleMouseMoveOnList = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.currentTarget;

    const rect = target.getBoundingClientRect();
    const scrollBarWidth = 20;

    const isOverVerticalScrollbar = e.clientX >= rect.right - scrollBarWidth;

    if (isOverVerticalScrollbar) {
      setIsListHovered(false);
    } else {
      // Don't update hover state if dropdown is open
      if (!isAnyDropdownOpen) {
        setIsListHovered(true);
      }
    }
  };
  const getTokenStateAmount = useTokenStateAmountStore(
    (state: { getAmount: (tokenState: TokenState) => number }) =>
      state.getAmount,
  );
  const setTokenStateAmount = useTokenStateAmountStore(
    (state: { setAmount: (tokenState: TokenState, amount: number) => void }) =>
      state.setAmount,
  );

  // Memoize the items data to prevent unnecessary re-renders

  const itemData = useMemo(
    () => ({
      items: isLoadingFilterFetch
        ? ([] as any)
        : isLoading && filteredList.length === 0
          ? ([] as any)
          : filteredList,
      amount: getTokenStateAmount("graduated"),
      column: 3,
    }),
    [filteredList, isLoading, isLoadingFilterFetch],
  );

  // Memoize the getItemKey function
  const getItemKey = (index: number) => {
    return itemData.items[index]?.mint || index;
  };

  const customizedSettingPresets = useCustomizeSettingsStore(
    (state) => state.presets,
  );
  const customizedSettingActivePreset = useCustomizeSettingsStore(
    (state) => state.activePreset,
  );

  const currentAvatarPreset =
    customizedSettingPresets[customizedSettingActivePreset].avatarSetting ||
    "normal";
  const currentFontPreset =
    customizedSettingPresets[customizedSettingActivePreset].fontSetting ||
    "normal";

  const combined = useMemo(() => {
    return [currentAvatarPreset, currentFontPreset];
  }, [currentAvatarPreset, currentFontPreset]);

  const avatarSetting = useMemo(() => {
    return presetPriority.find((p) => combined.includes(p));
  }, [combined]);

  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const [isQuickAmountFocused, setIsQuickAmountFocused] = useState(false);

  const popups = usePopupStore((state) => state.popups);
  const isSnapOpen = popups.some((p) => p.isOpen && p.snappedSide !== "none");

  return (
    <>
      {sizeVariant === "desktop" && (
        <div className="relative col-span-1 flex w-full flex-grow flex-col">
          <div className="flex flex-col gap-2 pb-4">
            <div className="flex w-full items-center justify-between gap-2 pt-4">
              <div className="flex items-center gap-x-2">
                <div
                  className={cn(
                    "flex flex-shrink-0 items-center gap-x-1.5",
                    remainingScreenWidth < 800 && "flex-shrink",
                  )}
                >
                  <h3
                    className={cn(
                      "font-geistSemiBold text-base text-fontColorPrimary",
                      remainingScreenWidth < 800 && "line-clamp-1 max-w-[55%]",
                    )}
                  >
                    Graduated
                  </h3>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="relative aspect-square h-4 w-4 flex-shrink-0">
                          <CachedImage
                            src="/icons/info-tooltip.png"
                            alt="Info Tooltip Icon"
                            fill
                            quality={50}
                            className="object-contain"
                          />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Graduated Tokens</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                <Separator
                  color="#202037"
                  orientation="vertical"
                  unit="fixed"
                  fixedHeight={24}
                  className={
                    isListHovered && !isCosmoTutorial
                      ? "visible block"
                      : "invisible hidden"
                  }
                />

                <div
                  className={cn(
                    "flex h-[24px] items-center gap-x-0.5 rounded-[4px] bg-success/20 px-1.5",
                    isListHovered && !isCosmoTutorial
                      ? "visible flex"
                      : "invisible hidden",
                  )}
                >
                  <div className="relative aspect-square h-5 w-5 flex-shrink-0">
                    <Image
                      src="/icons/paused.png"
                      alt="Pause Icon"
                      fill
                      quality={100}
                      className="object-contain"
                    />
                  </div>
                  <span
                    className={cn(
                      "hidden font-geistRegular text-sm text-success min-[1650px]:inline-block",
                      remainingScreenWidth <= 1440 && "min-[1650px]:hidden",
                    )}
                  >
                    Paused
                  </span>
                </div>
              </div>

              <div className="flex flex-1 items-center justify-end gap-2">
                <BaseButton
                  className="size-8"
                  onClick={() => {
                    setIsSearchFocused(!isSearchFocused);
                    setIsQuickAmountFocused(false);
                  }}
                >
                  <div className="relative aspect-square size-4">
                    <Search
                      height={16}
                      width={16}
                      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                    />
                  </div>
                </BaseButton>
                <GraduatedListFilterPopover
                  handleSendFilterMessage={handleSendFilterMessage}
                />

                <CosmoSound listType="graduated" />
                {isSnapOpen ? (
                  <BaseButton
                    className="size-8"
                    onClick={() => {
                      setIsQuickAmountFocused(!isQuickAmountFocused);
                      setIsSearchFocused(false);
                    }}
                  >
                    <div className="relative aspect-square size-4">
                      <Image
                        src="/icons/quickbuy.png"
                        alt="Quickbuy Icon"
                        fill
                        quality={100}
                        className="object-contain"
                      />
                    </div>
                  </BaseButton>
                ) : (
                  <QuickAmountInput
                    isLoading={false}
                    value={getTokenStateAmount("graduated")}
                    onChange={(val) => {
                      if (Number(val) >= 0.00001) {
                        setTokenStateAmount("graduated", Number(val));
                      }
                    }}
                    width={120}
                    className="flex flex-shrink flex-grow"
                  />
                )}
              </div>
            </div>

            {isSearchFocused && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{
                  duration: isSearchFocused ? 0.2 : 0.1,
                  ease: "easeOut",
                }}
                className="flex items-center justify-between gap-x-2"
              >
                <div className={cn("relative z-10 h-7 w-full")}>
                  <div
                    className={cn(
                      "absolute left-3 top-1/2 z-10 aspect-square h-4 w-4 flex-shrink-0 -translate-y-1/2",
                      remainingScreenWidth <= 1200 && "left-2",
                    )}
                  >
                    <Image
                      src="/icons/search-input.png"
                      alt="Search Icon"
                      fill
                      quality={100}
                      className="object-contain"
                    />
                  </div>
                  <Input
                    placeholder={
                      remainingScreenWidth <= 1200
                        ? "Search"
                        : "Search tokens..."
                    }
                    className={cn(
                      "h-7 w-full pl-8",
                      remainingScreenWidth <= 1200 && "pl-7",
                    )}
                    value={previewSearchValue}
                    onChange={handleSearchChange}
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-white"
                  onClick={() => setIsSearchFocused(false)}
                >
                  <X height={16} width={16} />
                </motion.button>
              </motion.div>
            )}

            {isQuickAmountFocused && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{
                  duration: isSearchFocused ? 0.2 : 0.1,
                  ease: "easeOut",
                }}
                className="flex items-center justify-between gap-x-2"
              >
                <div className="w-full">
                  <QuickAmountInput
                    isLoading={false}
                    value={getTokenStateAmount("graduated")}
                    onChange={(val) => {
                      if (Number(val) >= 0.00001) {
                        setTokenStateAmount("graduated", Number(val));
                      }
                    }}
                    // width={"100%"}
                    // className="!w-full"
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-white"
                  onClick={() => setIsQuickAmountFocused(false)}
                >
                  <X height={16} width={16} />
                </motion.button>
              </motion.div>
            )}
          </div>

          <div
            ref={listRef}
            onMouseMove={(e) => {
              if (
                isLoading ||
                isLoadingFilterFetch ||
                filteredList.length === 0 ||
                isAnyDropdownOpen
              )
                return;
              handleMouseMoveOnList(e);
            }}
            onMouseEnter={() => {
              setIsMouseOverList(true);
              if (
                isLoading ||
                isLoadingFilterFetch ||
                filteredList.length === 0 ||
                isAnyDropdownOpen
              )
                return;
              setIsListHovered(true);
              if (!isFilterApplied) {
                handleSetCurrentMintWhenListHovered();
              }
            }}
            onMouseLeave={() => {
              setIsMouseOverList(false);
              // Only reset if dropdown is not open
              if (!isAnyDropdownOpen) {
                setIsListHovered(false);
                setCurrentMintWhenListHovered([]);
              }
            }}
            className="nova-scroller relative w-full flex-grow"
          >
            {filteredList.length > 0 || isLoading || isLoadingFilterFetch ? (
              <FixedSizeList
                height={
                  window.innerHeight! -
                  (remainingScreenWidth >= 1314.9 &&
                  !isQuickAmountFocused &&
                  !isSearchFocused
                    ? isAnnouncementExist
                      ? 306
                      : 266
                    : 315)
                }
                width="100%"
                itemCount={
                  isLoadingFilterFetch ? 30 : filteredList?.length || 0
                }
                itemSize={setHeight(avatarSetting as AvatarSetting)}
                overscanCount={3}
                itemKey={getItemKey}
                itemData={itemData}
              >
                {CosmoCardRow}
              </FixedSizeList>
            ) : (
              <div className="absolute left-0 top-0 flex h-full w-full items-center justify-center">
                {checkBoxes.showHide ? (
                  <EmptyState state="Cosmo No Result With Hidden" />
                ) : (
                  <EmptyState state="Cosmo No Result" />
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {sizeVariant === "mobile" && (
        <div
          ref={listRef}
          className="nova-scroller flex h-full w-full flex-grow flex-col px-4 pt-3 xl:px-0"
          onMouseEnter={() => setIsMouseOverList(true)}
          onMouseLeave={() => {
            setIsMouseOverList(false);
            if (!isAnyDropdownOpen) {
              setIsListHovered(false);
              setCurrentMintWhenListHovered([]);
            }
          }}
        >
          {filteredList.length > 0 || isLoading || isLoadingFilterFetch ? (
            <FixedSizeList
              height={window.innerHeight! - 325}
              width="100%"
              itemCount={isLoadingFilterFetch ? 30 : filteredList?.length || 0}
              itemSize={setHeight(avatarSetting as AvatarSetting)}
              overscanCount={3}
              itemKey={getItemKey}
              itemData={itemData}
            >
              {CosmoCardRow}
            </FixedSizeList>
          ) : (
            <div className="absolute left-0 top-0 -z-10 flex h-full w-full items-center justify-center">
              {checkBoxes.showHide ? (
                <EmptyState state="Cosmo No Result With Hidden" />
              ) : (
                <EmptyState state="Cosmo No Result" />
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}
