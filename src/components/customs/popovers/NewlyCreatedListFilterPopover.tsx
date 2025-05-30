"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import React, { useState, useEffect, useMemo } from "react";
import {
  useNewlyCreatedFilterStore,
  NewlyCreatedFilterState,
} from "@/stores/cosmo/use-newly-created-filter.store";
import { useBlacklistedDeveloperFilterStore } from "@/stores/cosmo/use-blacklisted-developer-filter.store";
import { useWindowSizeStore } from "@/stores/use-window-size.store";
import { usePopupStore } from "@/stores/use-popup-state";
import toast from "react-hot-toast";
// ######## Components 🧩 ########
import Image from "next/image";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import BaseButton from "@/components/customs/buttons/BaseButton";
import Separator from "@/components/customs/Separator";
import FilterButton from "@/components/customs/buttons/FilterButton";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import CustomToast from "@/components/customs/toasts/CustomToast";
// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";
import convertCosmoIntoWSFilterFormat from "@/utils/convertCosmoIntoWSFilterFormat";
// ######## Types 🗨️ ########.
import { CosmoFilterSubscribeMessageType } from "@/types/ws-general";
import { useHiddenTokensStore } from "@/stores/cosmo/use-hidden-tokens.store";

const NewlyCreatedListFilterPopover = React.memo(
  ({
    handleSendFilterMessage,
  }: {
    handleSendFilterMessage?: (
      category: "created" | "aboutToGraduate" | "graduated",
      filterObject: CosmoFilterSubscribeMessageType,
    ) => void;
  }) => {
    // Filter & Hovered Configuration ✨
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
    } = useNewlyCreatedFilterStore((state) => state.filters.preview);
    const {
      checkBoxes: GcheckBoxes,
      showKeywords: GshowKeywords,
      doNotShowKeywords: GdoNotShowKeywords,
      byHoldersCount: GbyHoldersCount,
      byTop10Holders: GbyTop10Holders,
      byDevHoldingPercentage: GbyDevHoldingPercentage,
      byDevMigrated: GbyDevMigrated,
      bySnipers: GbySnipers,
      byInsiderHoldingPercentage: GbyInsiderHoldingPercentage,
      byBotHolders: GbyBotHolders,
      byAge: GbyAge,
      byCurrentLiquidity: GbyCurrentLiquidity,
      byVolume: GbyVolume,
      byMarketCap: GbyMarketCap,
      byTXNS: GbyTXNS,
      byBuys: GbyBuys,
      bySells: GbySells,
    } = useNewlyCreatedFilterStore((state) => state.filters.genuine);
    const {
      setIsLoadingFilterFetch,
      toggleNewlyCreatedFilter,
      setShowKeywords,
      setDoNotShowKeywords,
      setRangeFilter,
      resetNewlyCreatedFilters,
      applyNewlyCreatedFilters,
      updateNewlyCreatedFiltersCount,
    } = useNewlyCreatedFilterStore();

    const previewSelectedDexesCount = Object.entries(checkBoxes).filter(
      ([key, value]) => key !== "showHide" && value === true,
    ).length;

    const toggleNewlyCreatedFilterWithValidation = (
      filterKey: keyof NewlyCreatedFilterState["filters"]["preview"]["checkBoxes"],
      filterType: keyof NewlyCreatedFilterState["filters"],
    ) => {
      if (filterKey === "showHide") {
        toggleNewlyCreatedFilter(filterKey, filterType);
      } else {
        if (previewSelectedDexesCount === 1 && checkBoxes[filterKey]) {
          toast.custom((t) => (
            <CustomToast
              tVisibleState={t.visible}
              message="Please select at least one Dex"
              state="WARNING"
            />
          ));
        } else {
          toggleNewlyCreatedFilter(filterKey, filterType);
        }
      }
    };

    const isFilterApplied = useMemo(() => {
      const hasMinMaxFilter = (filter: {
        min: number | undefined;
        max: number | undefined;
      }) => filter?.min !== undefined || filter?.max !== undefined;

      return (
        GcheckBoxes.moonshot === false ||
        GcheckBoxes.pumpfun === false ||
        GcheckBoxes.dynamic_bonding_curve === false ||
        GcheckBoxes.launch_a_coin === false ||
        GcheckBoxes.bonk === false ||
        GcheckBoxes.launchlab === false ||
        GcheckBoxes.showHide === true ||
        GshowKeywords !== "" ||
        GdoNotShowKeywords !== "" ||
        hasMinMaxFilter(GbyHoldersCount) ||
        hasMinMaxFilter(GbyTop10Holders) ||
        hasMinMaxFilter(GbyDevHoldingPercentage) ||
        hasMinMaxFilter(GbyDevMigrated) ||
        hasMinMaxFilter(GbySnipers) ||
        hasMinMaxFilter(GbyInsiderHoldingPercentage) ||
        hasMinMaxFilter(GbyBotHolders) ||
        hasMinMaxFilter(GbyAge) ||
        hasMinMaxFilter(GbyCurrentLiquidity) ||
        hasMinMaxFilter(GbyVolume) ||
        hasMinMaxFilter(GbyMarketCap) ||
        hasMinMaxFilter(GbyTXNS) ||
        hasMinMaxFilter(GbyBuys) ||
        hasMinMaxFilter(GbySells)
      );
    }, [
      GcheckBoxes.moonshot,
      GcheckBoxes.pumpfun,
      GcheckBoxes.dynamic_bonding_curve,
      GcheckBoxes.launch_a_coin,
      GcheckBoxes.bonk,
      GcheckBoxes.launchlab,
      GcheckBoxes.showHide,
      GshowKeywords,
      GdoNotShowKeywords,
      GbyHoldersCount,
      GbyTop10Holders,
      GbyDevHoldingPercentage,
      GbyDevMigrated,
      GbySnipers,
      GbyInsiderHoldingPercentage,
      GbyBotHolders,
      GbyAge,
      GbyCurrentLiquidity,
      GbyVolume,
      GbyMarketCap,
      GbyTXNS,
      GbyBuys,
      GbySells,
    ]);

    const hiddenTokens = useHiddenTokensStore((s) => s.hiddenTokens);

    const { remainingScreenWidth } = usePopupStore();

    const [openFilterPopover, setOpenFilterPopover] = useState<boolean>(false);
    const [openFilterDrawer, setOpenFilterDrawer] = useState<boolean>(false);
    const customSetOpenFilterPopover = (isOpen: boolean) => {
      setOpenFilterPopover(isOpen);

      handleApplyFilter();
    };
    const customSetOpenFilterDrawer = (isOpen: boolean) => {
      setOpenFilterDrawer(isOpen);

      handleApplyFilter();
    };

    const width = useWindowSizeStore((state) => state.width);

    useEffect(() => {
      if (width! >= 1024 && openFilterDrawer) {
        setOpenFilterDrawer(false);
      } else if (width! < 1024 && openFilterPopover) {
        setOpenFilterPopover(false);
      }
    }, [width]);

    const handleNormalValue = (
      filterKey: keyof Omit<
        NewlyCreatedFilterState["filters"]["preview"],
        "checkBoxes" | "showKeywords" | "doNotShowKeywords"
      >,
      e: React.ChangeEvent<HTMLInputElement>,
      rangeType: "min" | "max",
    ) => {
      const value = e.target.value;
      const isValid =
        value === "" || /^[1-9]\d*(\.\d+)?$|^0(\.\d+)?$/.test(value);

      if (isValid) {
        setRangeFilter(
          filterKey,
          value === "" ? undefined : parseFloat(value),
          rangeType,
          "preview",
        );
      }
    };

    const handlePercentageValue = (
      filterKey: keyof Omit<
        NewlyCreatedFilterState["filters"]["preview"],
        "checkBoxes" | "showKeywords" | "doNotShowKeywords"
      >,
      e: React.ChangeEvent<HTMLInputElement>,
      rangeType: "min" | "max",
    ) => {
      const value = e.target.value;
      const isValid = value === "" || /^[1-9]$|^[1-9][0-9]$|^100$/.test(value);

      if (isValid) {
        setRangeFilter(
          filterKey,
          value === "" ? undefined : parseInt(value),
          rangeType,
          "preview",
        );
      }
    };

    const handleResetFilter = () => {
      setIsLoadingFilterFetch(true);

      resetNewlyCreatedFilters("preview");
      resetNewlyCreatedFilters("genuine");

      setOpenFilterPopover(false);
      setOpenFilterDrawer(false);

      applyNewlyCreatedFilters();

      handleApplyFilterAndSendMessage();
    };
    const handleApplyFilter = () => {
      setIsLoadingFilterFetch(true);

      setOpenFilterPopover(false);
      setOpenFilterDrawer(false);

      applyNewlyCreatedFilters();

      handleApplyFilterAndSendMessage();
    };

    const handleApplyFilterAndSendMessage = () => {
      const latestGenuineFilters =
        useNewlyCreatedFilterStore.getState().filters.genuine;
      const blacklist_developers =
        useBlacklistedDeveloperFilterStore.getState().blacklistedDevelopers;

      const filterObject = convertCosmoIntoWSFilterFormat(
        latestGenuineFilters,
        blacklist_developers,
        hiddenTokens?.join(","),
        "graduated",
      );

      handleSendFilterMessage?.("created", filterObject);
    };

    return (
      <>
        {/* Desktop */}
        <Popover
          open={openFilterPopover}
          onOpenChange={customSetOpenFilterPopover}
        >
          <PopoverTrigger asChild>
            <div className="relative">
              <FilterButton
                handleOpen={() => setOpenFilterPopover((prev) => !prev)}
                isActive={openFilterPopover}
                text="Filter"
                size="icon"
              />
              <span
                className={cn(
                  "absolute right-0 top-[1px] block size-1.5 rounded-full bg-primary duration-300",
                  isFilterApplied ? "opacity-100" : "opacity-0",
                )}
              />
            </div>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            sideOffset={8}
            className="gb__white__popover relative hidden h-[65vh] max-h-[1380px] min-h-[320px] w-[430px] flex-col border border-border bg-[#080811] px-0 pb-[70px] pt-0 shadow-[0_10px_20px_0_rgba(0,0,0,1)] lg:flex"
          >
            <div className="flex h-[52px] flex-row items-center justify-between border-b border-border p-4">
              <h4 className="font-geistSemiBold text-base text-fontColorPrimary">
                Filter
              </h4>
              <button
                title="Close"
                onClick={() => setOpenFilterPopover((prev) => !prev)}
                className="relative aspect-square h-6 w-6 flex-shrink-0"
              >
                <Image
                  src="/icons/close.png"
                  alt="Close Icon"
                  fill
                  quality={100}
                  className="object-contain"
                />
              </button>
            </div>

            {/* Fields */}
            <div className="nova-scroller relative w-full flex-grow">
              <div className="absolute left-0 top-0 w-full flex-grow">
                <div className="flex h-auto w-full flex-col">
                  {/* A. Dexes */}
                  <div className="flex w-full flex-col gap-y-2 p-4">
                    <button
                      onClick={() =>
                        toggleNewlyCreatedFilterWithValidation(
                          "pumpfun",
                          "preview",
                        )
                      }
                      className="flex h-8 w-full cursor-pointer items-center justify-between gap-x-2 rounded-[8px] border border-border bg-white/[3%] py-1 pl-2 pr-1 duration-300 hover:bg-white/[6%]"
                    >
                      <div className="flex items-center gap-x-2">
                        <div className="relative aspect-square h-5 w-5 flex-shrink-0">
                          <Image
                            src="/icons/asset/pumpfun.png"
                            alt="Pumpfun Icon"
                            fill
                            quality={100}
                            className="object-contain"
                          />
                        </div>
                        <span className="inline-block text-nowrap text-sm text-fontColorPrimary">
                          Pump.Fun
                        </span>
                      </div>
                      <div className="relative aspect-square h-6 w-6 flex-shrink-0">
                        <Image
                          src={
                            checkBoxes?.pumpfun
                              ? "/icons/footer/checked.png"
                              : "/icons/footer/unchecked.png"
                          }
                          alt="Check / Unchecked Icon"
                          fill
                          quality={100}
                          className="object-contain"
                        />
                      </div>
                    </button>
                    <button
                      onClick={() =>
                        toggleNewlyCreatedFilterWithValidation(
                          "moonshot",
                          "preview",
                        )
                      }
                      className="flex h-8 w-full cursor-pointer items-center justify-between gap-x-2 rounded-[8px] border border-border bg-white/[3%] py-1 pl-2 pr-1 duration-300 hover:bg-white/[6%]"
                    >
                      <div className="flex items-center gap-x-2">
                        <div className="relative aspect-square h-5 w-5 flex-shrink-0">
                          <Image
                            src="/icons/asset/moonshot.png"
                            alt="Moonshot Icon"
                            fill
                            quality={100}
                            className="object-contain"
                          />
                        </div>
                        <span className="inline-block text-nowrap text-sm text-fontColorPrimary">
                          Moonshot
                        </span>
                      </div>
                      <div className="relative aspect-square h-6 w-6 flex-shrink-0">
                        <Image
                          src={
                            checkBoxes?.moonshot
                              ? "/icons/footer/checked.png"
                              : "/icons/footer/unchecked.png"
                          }
                          alt="Check / Unchecked Icon"
                          fill
                          quality={100}
                          className="object-contain"
                        />
                      </div>
                    </button>
                    <button
                      onClick={() =>
                        toggleNewlyCreatedFilterWithValidation(
                          "dynamic_bonding_curve",
                          "preview",
                        )
                      }
                      className="flex h-8 w-full cursor-pointer items-center justify-between gap-x-2 rounded-[8px] border border-border bg-white/[3%] py-1 pl-2 pr-1 duration-300 hover:bg-white/[6%]"
                    >
                      <div className="flex items-center gap-x-2">
                        <div className="relative aspect-square h-5 w-5 flex-shrink-0 brightness-150 hue-rotate-[80deg] saturate-150">
                          <Image
                            src="/icons/asset/meteora.png"
                            alt="Dynamic Bonding Curve Icon"
                            fill
                            quality={100}
                            className="object-contain"
                          />
                        </div>
                        <span className="inline-block text-nowrap text-sm text-fontColorPrimary">
                          Dynamic Bonding Curve
                        </span>
                      </div>
                      <div className="relative aspect-square h-6 w-6 flex-shrink-0">
                        <Image
                          src={
                            checkBoxes?.dynamic_bonding_curve
                              ? "/icons/footer/checked.png"
                              : "/icons/footer/unchecked.png"
                          }
                          alt="Check / Unchecked Icon"
                          fill
                          quality={100}
                          className="object-contain"
                        />
                      </div>
                    </button>
                    <button
                      onClick={() =>
                        toggleNewlyCreatedFilterWithValidation(
                          "bonk",
                          "preview",
                        )
                      }
                      className="flex h-8 w-full cursor-pointer items-center justify-between gap-x-2 rounded-[8px] border border-border bg-white/[3%] py-1 pl-2 pr-1 duration-300 hover:bg-white/[6%]"
                    >
                      <div className="flex items-center gap-x-2">
                        <div className="relative aspect-square h-5 w-5 flex-shrink-0">
                          <Image
                            src="/icons/asset/bonk.png"
                            alt="Bonk Icon"
                            fill
                            quality={100}
                            className="object-contain"
                          />
                        </div>
                        <span className="inline-block text-nowrap text-sm text-fontColorPrimary">
                          Bonk
                        </span>
                      </div>
                      <div className="relative aspect-square h-6 w-6 flex-shrink-0">
                        <Image
                          src={
                            checkBoxes?.bonk
                              ? "/icons/footer/checked.png"
                              : "/icons/footer/unchecked.png"
                          }
                          alt="Check / Unchecked Icon"
                          fill
                          quality={100}
                          className="object-contain"
                        />
                      </div>
                    </button>
                    <button
                      onClick={() =>
                        toggleNewlyCreatedFilterWithValidation(
                          "launch_a_coin",
                          "preview",
                        )
                      }
                      className="flex h-8 w-full cursor-pointer items-center justify-between gap-x-2 rounded-[8px] border border-border bg-white/[3%] py-1 pl-2 pr-1 duration-300 hover:bg-white/[6%]"
                    >
                      <div className="flex items-center gap-x-2">
                        <div className="relative aspect-square h-5 w-5 flex-shrink-0">
                          <Image
                            src="/icons/asset/launch_a_coin.png"
                            alt="Launch a Coin Icon"
                            fill
                            quality={100}
                            className="object-contain"
                          />
                        </div>
                        <span className="inline-block text-nowrap text-sm text-fontColorPrimary">
                          Launch a Coin
                        </span>
                      </div>
                      <div className="relative aspect-square h-6 w-6 flex-shrink-0">
                        <Image
                          src={
                            checkBoxes?.launch_a_coin
                              ? "/icons/footer/checked.png"
                              : "/icons/footer/unchecked.png"
                          }
                          alt="Check / Unchecked Icon"
                          fill
                          quality={100}
                          className="object-contain"
                        />
                      </div>
                    </button>
                    <button
                      onClick={() =>
                        toggleNewlyCreatedFilterWithValidation(
                          "launchlab",
                          "preview",
                        )
                      }
                      className="flex h-8 w-full cursor-pointer items-center justify-between gap-x-2 rounded-[8px] border border-border bg-white/[3%] py-1 pl-2 pr-1 duration-300 hover:bg-white/[6%]"
                    >
                      <div className="flex items-center gap-x-2">
                        <div className="relative aspect-square h-5 w-5 flex-shrink-0 hue-rotate-[150deg] saturate-200">
                          <Image
                            src="/icons/asset/raydium.png"
                            alt="LaunchLab Icon"
                            fill
                            quality={100}
                            className="object-contain"
                          />
                        </div>
                        <span className="inline-block text-nowrap text-sm text-fontColorPrimary">
                          LaunchLab
                        </span>
                      </div>
                      <div className="relative aspect-square h-6 w-6 flex-shrink-0">
                        <Image
                          src={
                            checkBoxes?.launchlab
                              ? "/icons/footer/checked.png"
                              : "/icons/footer/unchecked.png"
                          }
                          alt="Check / Unchecked Icon"
                          fill
                          quality={100}
                          className="object-contain"
                        />
                      </div>
                    </button>
                    {/* <button
                      onClick={() =>
                        toggleNewlyCreatedFilterWithValidation("boop", "preview")
                      }
                      className="flex h-8 w-full cursor-pointer items-center justify-between gap-x-2 rounded-[8px] border border-border bg-white/[3%] py-1 pl-2 pr-1 duration-300 hover:bg-white/[6%]"
                    >
                      <div className="flex items-center gap-x-2">
                        <div className="relative aspect-square h-5 w-5 flex-shrink-0 overflow-hidden rounded-full">
                          <Image
                            src="/icons/asset/boop.png"
                            alt="Boop Icon"
                            fill
                            quality={100}
                            className="object-contain"
                          />
                        </div>
                        <span className="inline-block text-nowrap text-sm text-fontColorPrimary">
                          Boop
                        </span>
                      </div>
                      <div className="relative aspect-square h-6 w-6 flex-shrink-0">
                        <Image
                          src={
                            checkBoxes?.boop
                              ? "/icons/footer/checked.png"
                              : "/icons/footer/unchecked.png"
                          }
                          alt="Check / Unchecked Icon"
                          fill
                          quality={100}
                          className="object-contain"
                        />
                      </div>
                    </button> */}
                  </div>

                  <Separator />

                  {/* Show Hidden */}
                  <div className="flex w-full p-4">
                    <div className="flex w-full flex-col gap-y-1">
                      <Label
                        htmlFor="showhiddencoinsfilter"
                        className="justify-between text-nowrap text-sm text-fontColorSecondary"
                      >
                        Show Hidden Coins Filter
                      </Label>
                      <button
                        onClick={() =>
                          toggleNewlyCreatedFilterWithValidation(
                            "showHide",
                            "preview",
                          )
                        }
                        className="flex h-8 w-full cursor-pointer items-center justify-between gap-x-2 rounded-[8px] border border-border bg-white/[3%] py-1 pl-2 pr-1 duration-300 hover:bg-white/[6%]"
                      >
                        <div className="flex items-center">
                          <span className="inline-block text-nowrap text-sm text-fontColorPrimary">
                            Show Hidden Coins
                          </span>
                        </div>
                        <div className="relative aspect-square h-6 w-6 flex-shrink-0">
                          <Image
                            src={
                              checkBoxes?.showHide
                                ? "/icons/footer/checked.png"
                                : "/icons/footer/unchecked.png"
                            }
                            alt="Check / Unchecked Icon"
                            fill
                            quality={100}
                            className="object-contain"
                          />
                        </div>
                      </button>
                    </div>
                  </div>

                  <Separator />

                  {/* B. Symbol / Name */}
                  <div className="flex w-full justify-between gap-x-2 p-4">
                    <div className="flex flex-col gap-y-1">
                      <Label
                        htmlFor="showsymbolorname"
                        className="justify-between text-nowrap text-sm text-fontColorSecondary"
                      >
                        Symbol/Name
                      </Label>
                      <Input
                        id="showsymbolorname"
                        type="text"
                        value={showKeywords}
                        onChange={(e) =>
                          setShowKeywords(e.target.value, "preview")
                        }
                        placeholder="Enter Max 3 Keywords"
                        className="block h-8 w-full text-nowrap border-border bg-transparent text-sm text-fontColorPrimary placeholder:text-fontColorSecondary focus:outline-none focus:ring-0"
                      />
                    </div>

                    <div className="flex flex-col gap-y-1">
                      <Label
                        htmlFor="notshowsymbolorname"
                        className="ustify-between text-nowrap text-sm text-fontColorSecondary"
                      >
                        Do not show Symbol/Name
                      </Label>
                      <Input
                        id="notshowsymbolorname"
                        type="text"
                        value={doNotShowKeywords}
                        onChange={(e) =>
                          setDoNotShowKeywords(e.target.value, "preview")
                        }
                        placeholder="Enter Max 3 Keywords"
                        className="block h-8 w-full text-nowrap border-border bg-transparent text-sm text-fontColorPrimary placeholder:text-fontColorSecondary focus:outline-none focus:ring-0"
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* C. By Range */}
                  <div className="flex w-full flex-col gap-y-4 p-4">
                    {/* By Market Cap */}
                    <div className="flex items-center gap-x-2">
                      <Label className="w-[80%] justify-between text-nowrap text-sm text-fontColorSecondary">
                        By Market Cap
                      </Label>
                      <div className="flex w-full items-center gap-x-2">
                        <Input
                          type="number"
                          value={byMarketCap?.min}
                          onChange={(e) =>
                            handleNormalValue("byMarketCap", e, "min")
                          }
                          placeholder="Min"
                          className="block h-8 w-full text-nowrap border-border bg-transparent text-sm text-fontColorPrimary placeholder:text-fontColorSecondary focus:outline-none focus:ring-0"
                        />
                        {/* <div className="flex-shrink-0 text-sm text-fontColorSecondary">
                        to
                      </div> */}
                        <Input
                          type="number"
                          value={byMarketCap?.max}
                          onChange={(e) =>
                            handleNormalValue("byMarketCap", e, "max")
                          }
                          placeholder="Max"
                          className="block h-8 w-full text-nowrap border-border bg-transparent text-sm text-fontColorPrimary placeholder:text-fontColorSecondary focus:outline-none focus:ring-0"
                        />
                      </div>
                    </div>

                    {/* By Holders Count */}
                    <div className="flex items-center gap-x-2">
                      <Label className="w-[80%] justify-between text-nowrap text-sm text-fontColorSecondary">
                        By Holders Count
                      </Label>
                      <div className="flex w-full items-center gap-x-2">
                        <Input
                          type="number"
                          value={byHoldersCount?.min}
                          onChange={(e) =>
                            handleNormalValue("byHoldersCount", e, "min")
                          }
                          placeholder="Min"
                          className="block h-8 w-full text-nowrap border-border bg-transparent text-sm text-fontColorPrimary placeholder:text-fontColorSecondary focus:outline-none focus:ring-0"
                        />
                        {/* <div className="flex-shrink-0 text-sm text-fontColorSecondary">
                        to
                      </div> */}
                        <Input
                          type="number"
                          value={byHoldersCount?.max}
                          onChange={(e) =>
                            handleNormalValue("byHoldersCount", e, "max")
                          }
                          placeholder="Max"
                          className="block h-8 w-full text-nowrap border-border bg-transparent text-sm text-fontColorPrimary placeholder:text-fontColorSecondary focus:outline-none focus:ring-0"
                        />
                      </div>
                    </div>

                    {/* By Top 10 Holders % */}
                    <div className="flex items-center gap-x-2">
                      <Label className="w-[80%] justify-between text-nowrap text-sm text-fontColorSecondary">
                        By Top 10 Holders %
                      </Label>
                      <div className="flex w-full items-center gap-x-2">
                        <div className="relative w-full">
                          <Input
                            type="number"
                            value={byTop10Holders?.min}
                            onChange={(e) =>
                              handlePercentageValue("byTop10Holders", e, "min")
                            }
                            placeholder="Min"
                            className="block h-8 w-full text-nowrap border-border bg-transparent text-sm text-fontColorPrimary placeholder:text-fontColorSecondary focus:outline-none focus:ring-0"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-fontColorSecondary">
                            %
                          </span>
                        </div>
                        <div className="relative w-full">
                          <Input
                            type="number"
                            value={byTop10Holders?.max}
                            onChange={(e) =>
                              handlePercentageValue("byTop10Holders", e, "max")
                            }
                            placeholder="Max"
                            className="block h-8 w-full text-nowrap border-border bg-transparent text-sm text-fontColorPrimary placeholder:text-fontColorSecondary focus:outline-none focus:ring-0"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-fontColorSecondary">
                            %
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* By Dev Holding % */}
                    <div className="flex items-center gap-x-2">
                      <Label className="w-[80%] justify-between text-nowrap text-sm text-fontColorSecondary">
                        By Dev Holding %
                      </Label>
                      <div className="flex w-full items-center gap-x-2">
                        <div className="relative w-full">
                          <Input
                            type="number"
                            value={byDevHoldingPercentage?.min}
                            onChange={(e) =>
                              handlePercentageValue(
                                "byDevHoldingPercentage",
                                e,
                                "min",
                              )
                            }
                            placeholder="Min"
                            className="block h-8 w-full text-nowrap border-border bg-transparent text-sm text-fontColorPrimary placeholder:text-fontColorSecondary focus:outline-none focus:ring-0"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-fontColorSecondary">
                            %
                          </span>
                        </div>
                        {/* <div className="flex-shrink-0 text-sm text-fontColorSecondary">
                        to
                      </div> */}
                        <div className="relative w-full">
                          <Input
                            type="number"
                            value={byDevHoldingPercentage?.max}
                            onChange={(e) =>
                              handlePercentageValue(
                                "byDevHoldingPercentage",
                                e,
                                "max",
                              )
                            }
                            placeholder="Max"
                            className="block h-8 w-full text-nowrap border-border bg-transparent text-sm text-fontColorPrimary placeholder:text-fontColorSecondary focus:outline-none focus:ring-0"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-fontColorSecondary">
                            %
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* By Dev Migrated */}
                    <div className="flex items-center gap-x-2">
                      <Label className="w-[80%] justify-between text-nowrap text-sm text-fontColorSecondary">
                        By Dev Migrated
                      </Label>
                      <div className="flex w-full items-center gap-x-2">
                        <Input
                          type="number"
                          value={byDevMigrated?.min}
                          onChange={(e) =>
                            handleNormalValue("byDevMigrated", e, "min")
                          }
                          placeholder="Min"
                          className="block h-8 w-full text-nowrap border-border bg-transparent text-sm text-fontColorPrimary placeholder:text-fontColorSecondary focus:outline-none focus:ring-0"
                        />
                        {/* <div className="flex-shrink-0 text-sm text-fontColorSecondary">
                        to
                      </div> */}
                        <Input
                          type="number"
                          value={byDevMigrated?.max}
                          onChange={(e) =>
                            handleNormalValue("byDevMigrated", e, "max")
                          }
                          placeholder="Max"
                          className="block h-8 w-full text-nowrap border-border bg-transparent text-sm text-fontColorPrimary placeholder:text-fontColorSecondary focus:outline-none focus:ring-0"
                        />
                      </div>
                    </div>

                    {/* By Sniper */}
                    <div className="flex items-center gap-x-2">
                      <Label className="w-[80%] justify-between text-nowrap text-sm text-fontColorSecondary">
                        By Snipers
                      </Label>
                      <div className="flex w-full items-center gap-x-2">
                        <Input
                          type="number"
                          value={bySnipers?.min}
                          onChange={(e) =>
                            handleNormalValue("bySnipers", e, "min")
                          }
                          placeholder="Min"
                          className="block h-8 w-full text-nowrap border-border bg-transparent text-sm text-fontColorPrimary placeholder:text-fontColorSecondary focus:outline-none focus:ring-0"
                        />
                        {/* <div className="flex-shrink-0 text-sm text-fontColorSecondary">
                        to
                      </div> */}
                        <Input
                          type="number"
                          value={bySnipers?.max}
                          onChange={(e) =>
                            handleNormalValue("bySnipers", e, "max")
                          }
                          placeholder="Max"
                          className="block h-8 w-full text-nowrap border-border bg-transparent text-sm text-fontColorPrimary placeholder:text-fontColorSecondary focus:outline-none focus:ring-0"
                        />
                      </div>
                    </div>

                    {/* By Insider Holding % */}
                    <div className="flex items-center gap-x-2">
                      <Label className="w-[80%] justify-between text-nowrap text-sm text-fontColorSecondary">
                        By Insider Holding %
                      </Label>
                      <div className="flex w-full items-center gap-x-2">
                        <div className="relative w-full">
                          <Input
                            type="number"
                            value={byInsiderHoldingPercentage?.min}
                            onChange={(e) =>
                              handlePercentageValue(
                                "byInsiderHoldingPercentage",
                                e,
                                "min",
                              )
                            }
                            placeholder="Min"
                            className="block h-8 w-full text-nowrap border-border bg-transparent text-sm text-fontColorPrimary placeholder:text-fontColorSecondary focus:outline-none focus:ring-0"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-fontColorSecondary">
                            %
                          </span>
                        </div>
                        {/* <div className="flex-shrink-0 text-sm text-fontColorSecondary">
                        to
                      </div> */}
                        <div className="relative w-full">
                          <Input
                            type="number"
                            value={byInsiderHoldingPercentage?.max}
                            onChange={(e) =>
                              handlePercentageValue(
                                "byInsiderHoldingPercentage",
                                e,
                                "max",
                              )
                            }
                            placeholder="Max"
                            className="block h-8 w-full text-nowrap border-border bg-transparent text-sm text-fontColorPrimary placeholder:text-fontColorSecondary focus:outline-none focus:ring-0"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-fontColorSecondary">
                            %
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* By Bot Holders */}
                    <div className="flex items-center gap-x-2">
                      <Label className="w-[80%] justify-between text-nowrap text-sm text-fontColorSecondary">
                        By Bot Holders
                      </Label>
                      <div className="flex w-full items-center gap-x-2">
                        <Input
                          type="number"
                          value={byBotHolders?.min}
                          onChange={(e) =>
                            handleNormalValue("byBotHolders", e, "min")
                          }
                          placeholder="Min"
                          className="block h-8 w-full text-nowrap border-border bg-transparent text-sm text-fontColorPrimary placeholder:text-fontColorSecondary focus:outline-none focus:ring-0"
                        />
                        {/* <div className="flex-shrink-0 text-sm text-fontColorSecondary">
                        to
                      </div> */}
                        <Input
                          type="number"
                          value={byBotHolders?.max}
                          onChange={(e) =>
                            handleNormalValue("byBotHolders", e, "max")
                          }
                          placeholder="Max"
                          className="block h-8 w-full text-nowrap border-border bg-transparent text-sm text-fontColorPrimary placeholder:text-fontColorSecondary focus:outline-none focus:ring-0"
                        />
                      </div>
                    </div>

                    {/* By Age (Mins) */}
                    <div className="flex items-center gap-x-2">
                      <Label className="w-[80%] justify-between text-nowrap text-sm text-fontColorSecondary">
                        By Age (Mins)
                      </Label>
                      <div className="flex w-full items-center gap-x-2">
                        <Input
                          type="number"
                          value={byAge?.min}
                          onChange={(e) => handleNormalValue("byAge", e, "min")}
                          placeholder="Min"
                          className="block h-8 w-full text-nowrap border-border bg-transparent text-sm text-fontColorPrimary placeholder:text-fontColorSecondary focus:outline-none focus:ring-0"
                        />
                        {/* <div className="flex-shrink-0 text-sm text-fontColorSecondary">
                        to
                      </div> */}
                        <Input
                          type="number"
                          value={byAge?.max}
                          onChange={(e) => handleNormalValue("byAge", e, "max")}
                          placeholder="Max"
                          className="block h-8 w-full text-nowrap border-border bg-transparent text-sm text-fontColorPrimary placeholder:text-fontColorSecondary focus:outline-none focus:ring-0"
                        />
                      </div>
                    </div>

                    {/* By Current Liquidity($) */}
                    <div className="flex items-center gap-x-2">
                      <Label className="w-[80%] justify-between text-nowrap text-sm text-fontColorSecondary">
                        By Current Liquidity($)
                      </Label>
                      <div className="flex w-full items-center gap-x-2">
                        <Input
                          type="number"
                          value={byCurrentLiquidity?.min}
                          onChange={(e) =>
                            handleNormalValue("byCurrentLiquidity", e, "min")
                          }
                          placeholder="Min"
                          className="block h-8 w-full text-nowrap border-border bg-transparent text-sm text-fontColorPrimary placeholder:text-fontColorSecondary focus:outline-none focus:ring-0"
                        />
                        {/* <div className="flex-shrink-0 text-sm text-fontColorSecondary">
                        to
                      </div> */}
                        <Input
                          type="number"
                          value={byCurrentLiquidity?.max}
                          onChange={(e) =>
                            handleNormalValue("byCurrentLiquidity", e, "max")
                          }
                          placeholder="Max"
                          className="block h-8 w-full text-nowrap border-border bg-transparent text-sm text-fontColorPrimary placeholder:text-fontColorSecondary focus:outline-none focus:ring-0"
                        />
                      </div>
                    </div>

                    {/* By Volume */}
                    <div className="flex items-center gap-x-2">
                      <Label className="w-[80%] justify-between text-nowrap text-sm text-fontColorSecondary">
                        By Volume
                      </Label>
                      <div className="flex w-full items-center gap-x-2">
                        <Input
                          type="number"
                          value={byVolume?.min}
                          onChange={(e) =>
                            handleNormalValue("byVolume", e, "min")
                          }
                          placeholder="Min"
                          className="block h-8 w-full text-nowrap border-border bg-transparent text-sm text-fontColorPrimary placeholder:text-fontColorSecondary focus:outline-none focus:ring-0"
                        />
                        {/* <div className="flex-shrink-0 text-sm text-fontColorSecondary">
                        to
                      </div> */}
                        <Input
                          type="number"
                          value={byVolume?.max}
                          onChange={(e) =>
                            handleNormalValue("byVolume", e, "max")
                          }
                          placeholder="Max"
                          className="block h-8 w-full text-nowrap border-border bg-transparent text-sm text-fontColorPrimary placeholder:text-fontColorSecondary focus:outline-none focus:ring-0"
                        />
                      </div>
                    </div>

                    {/* By TXNS */}
                    <div className="flex items-center gap-x-2">
                      <Label className="w-[80%] justify-between text-nowrap text-sm text-fontColorSecondary">
                        By TXNS
                      </Label>
                      <div className="flex w-full items-center gap-x-2">
                        <Input
                          type="number"
                          value={byTXNS?.min}
                          onChange={(e) =>
                            handleNormalValue("byTXNS", e, "min")
                          }
                          placeholder="Min"
                          className="block h-8 w-full text-nowrap border-border bg-transparent text-sm text-fontColorPrimary placeholder:text-fontColorSecondary focus:outline-none focus:ring-0"
                        />
                        {/* <div className="flex-shrink-0 text-sm text-fontColorSecondary">
                        to
                      </div> */}
                        <Input
                          type="number"
                          value={byTXNS?.max}
                          onChange={(e) =>
                            handleNormalValue("byTXNS", e, "max")
                          }
                          placeholder="Max"
                          className="block h-8 w-full text-nowrap border-border bg-transparent text-sm text-fontColorPrimary placeholder:text-fontColorSecondary focus:outline-none focus:ring-0"
                        />
                      </div>
                    </div>

                    {/* By Buys */}
                    <div className="flex items-center gap-x-2">
                      <Label className="w-[80%] justify-between text-nowrap text-sm text-fontColorSecondary">
                        By Buys
                      </Label>
                      <div className="flex w-full items-center gap-x-2">
                        <Input
                          type="number"
                          value={byBuys?.min}
                          onChange={(e) =>
                            handleNormalValue("byBuys", e, "min")
                          }
                          placeholder="Min"
                          className="block h-8 w-full text-nowrap border-border bg-transparent text-sm text-fontColorPrimary placeholder:text-fontColorSecondary focus:outline-none focus:ring-0"
                        />
                        {/* <div className="flex-shrink-0 text-sm text-fontColorSecondary">
                        to
                      </div> */}
                        <Input
                          type="number"
                          value={byBuys?.max}
                          onChange={(e) =>
                            handleNormalValue("byBuys", e, "max")
                          }
                          placeholder="Max"
                          className="block h-8 w-full text-nowrap border-border bg-transparent text-sm text-fontColorPrimary placeholder:text-fontColorSecondary focus:outline-none focus:ring-0"
                        />
                      </div>
                    </div>

                    {/* By Sells */}
                    <div className="flex items-center gap-x-2">
                      <Label className="w-[80%] justify-between text-nowrap text-sm text-fontColorSecondary">
                        By Sells
                      </Label>
                      <div className="flex w-full items-center gap-x-2">
                        <Input
                          type="number"
                          value={bySells?.min}
                          onChange={(e) =>
                            handleNormalValue("bySells", e, "min")
                          }
                          placeholder="Min"
                          className="block h-8 w-full text-nowrap border-border bg-transparent text-sm text-fontColorPrimary placeholder:text-fontColorSecondary focus:outline-none focus:ring-0"
                        />
                        {/* <div className="flex-shrink-0 text-sm text-fontColorSecondary">
                        to
                      </div> */}
                        <Input
                          type="number"
                          value={bySells?.max}
                          onChange={(e) =>
                            handleNormalValue("bySells", e, "max")
                          }
                          placeholder="Max"
                          className="block h-8 w-full text-nowrap border-border bg-transparent text-sm text-fontColorPrimary placeholder:text-fontColorSecondary focus:outline-none focus:ring-0"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="absolute bottom-[0px] left-0 flex h-[64px] w-full items-center justify-between gap-x-3 rounded-b-[8px] border-t border-border bg-[#080811] p-4">
              <button
                onClick={handleResetFilter}
                className="font-geistSemiBold text-sm text-primary duration-300 hover:text-[#be7ad2]"
              >
                Reset
              </button>
              <BaseButton
                type="button"
                onClick={handleApplyFilter}
                variant="primary"
                className="h-8 px-10"
              >
                <span className="text-sm">Apply</span>
              </BaseButton>
            </div>
          </PopoverContent>
        </Popover>

        {/* Mobile */}
        <div
          onClick={() => setOpenFilterDrawer((prev) => !prev)}
          className="flex h-[32px] w-[32px] flex-shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-border lg:hidden"
        >
          <div className="relative aspect-square h-4 w-4 flex-shrink-0">
            <Image
              src="/icons/filter.png"
              alt="Filter Icon"
              fill
              quality={100}
              className="object-contain"
            />
          </div>
        </div>
        <Drawer
          open={openFilterDrawer}
          onOpenChange={customSetOpenFilterDrawer}
        >
          {/* <DrawerTrigger asChild type="button">
        </DrawerTrigger> */}
          <DrawerContent>
            <DrawerHeader className="flex h-[62px] flex-row items-center justify-between border-b border-border p-4">
              <DrawerTitle>Filter</DrawerTitle>
              <button
                title="Close"
                onClick={() => {
                  setOpenFilterDrawer((prev) => !prev);
                  handleApplyFilter();
                }}
                className="relative aspect-square h-6 w-6 flex-shrink-0"
              >
                <Image
                  src="/icons/close.png"
                  alt="Close Icon"
                  fill
                  quality={100}
                  className="object-contain"
                />
              </button>
            </DrawerHeader>

            {/* Fields */}
            <div className="relative h-[87dvh] w-full flex-grow px-0 pb-[70px] pt-0">
              <div className="nova-scroller flex h-full w-full">
                <div className="flex h-auto w-full flex-col">
                  {/* A. Dexes */}
                  <div className="flex w-full flex-col gap-y-2 p-4">
                    <button
                      onClick={() =>
                        toggleNewlyCreatedFilterWithValidation(
                          "pumpfun",
                          "preview",
                        )
                      }
                      className="flex h-8 w-full cursor-pointer items-center justify-between gap-x-2 rounded-[8px] border border-border bg-white/[3%] py-1 pl-2 pr-1 duration-300 hover:bg-white/[6%]"
                    >
                      <div className="flex items-center gap-x-2">
                        <div className="relative aspect-square h-5 w-5 flex-shrink-0">
                          <Image
                            src="/icons/asset/pumpfun.png"
                            alt="Pumpfun Icon"
                            fill
                            quality={100}
                            className="object-contain"
                          />
                        </div>
                        <span className="inline-block text-nowrap text-sm text-fontColorPrimary">
                          Pump.Fun
                        </span>
                      </div>
                      <div className="relative aspect-square h-6 w-6 flex-shrink-0">
                        <Image
                          src={
                            checkBoxes?.pumpfun
                              ? "/icons/footer/checked.png"
                              : "/icons/footer/unchecked.png"
                          }
                          alt="Check / Unchecked Icon"
                          fill
                          quality={100}
                          className="object-contain"
                        />
                      </div>
                    </button>
                    <button
                      onClick={() =>
                        toggleNewlyCreatedFilterWithValidation(
                          "moonshot",
                          "preview",
                        )
                      }
                      className="flex h-8 w-full cursor-pointer items-center justify-between gap-x-2 rounded-[8px] border border-border bg-white/[3%] py-1 pl-2 pr-1 duration-300 hover:bg-white/[6%]"
                    >
                      <div className="flex items-center gap-x-2">
                        <div className="relative aspect-square h-5 w-5 flex-shrink-0">
                          <Image
                            src="/icons/asset/moonshot.png"
                            alt="Moonshot Icon"
                            fill
                            quality={100}
                            className="object-contain"
                          />
                        </div>
                        <span className="inline-block text-nowrap text-sm text-fontColorPrimary">
                          Moonshot
                        </span>
                      </div>
                      <div className="relative aspect-square h-6 w-6 flex-shrink-0">
                        <Image
                          src={
                            checkBoxes?.moonshot
                              ? "/icons/footer/checked.png"
                              : "/icons/footer/unchecked.png"
                          }
                          alt="Check / Unchecked Icon"
                          fill
                          quality={100}
                          className="object-contain"
                        />
                      </div>
                    </button>
                    <button
                      onClick={() =>
                        toggleNewlyCreatedFilterWithValidation(
                          "dynamic_bonding_curve",
                          "preview",
                        )
                      }
                      className="flex h-8 w-full cursor-pointer items-center justify-between gap-x-2 rounded-[8px] border border-border bg-white/[3%] py-1 pl-2 pr-1 duration-300 hover:bg-white/[6%]"
                    >
                      <div className="flex items-center gap-x-2">
                        <div className="relative aspect-square h-5 w-5 flex-shrink-0 brightness-150 hue-rotate-[80deg] saturate-150">
                          <Image
                            src="/icons/asset/meteora.png"
                            alt="Dynamic Bonding Curve Icon"
                            fill
                            quality={100}
                            className="object-contain"
                          />
                        </div>
                        <span className="inline-block text-nowrap text-sm text-fontColorPrimary">
                          Dynamic Bonding Curve
                        </span>
                      </div>
                      <div className="relative aspect-square h-6 w-6 flex-shrink-0">
                        <Image
                          src={
                            checkBoxes?.dynamic_bonding_curve
                              ? "/icons/footer/checked.png"
                              : "/icons/footer/unchecked.png"
                          }
                          alt="Check / Unchecked Icon"
                          fill
                          quality={100}
                          className="object-contain"
                        />
                      </div>
                    </button>
                    <button
                      onClick={() =>
                        toggleNewlyCreatedFilterWithValidation(
                          "bonk",
                          "preview",
                        )
                      }
                      className="flex h-8 w-full cursor-pointer items-center justify-between gap-x-2 rounded-[8px] border border-border bg-white/[3%] py-1 pl-2 pr-1 duration-300 hover:bg-white/[6%]"
                    >
                      <div className="flex items-center gap-x-2">
                        <div className="relative aspect-square h-5 w-5 flex-shrink-0">
                          <Image
                            src="/icons/asset/bonk.png"
                            alt="Bonk Icon"
                            fill
                            quality={100}
                            className="object-contain"
                          />
                        </div>
                        <span className="inline-block text-nowrap text-sm text-fontColorPrimary">
                          Bonk
                        </span>
                      </div>
                      <div className="relative aspect-square h-6 w-6 flex-shrink-0">
                        <Image
                          src={
                            checkBoxes?.bonk
                              ? "/icons/footer/checked.png"
                              : "/icons/footer/unchecked.png"
                          }
                          alt="Check / Unchecked Icon"
                          fill
                          quality={100}
                          className="object-contain"
                        />
                      </div>
                    </button>
                    <button
                      onClick={() =>
                        toggleNewlyCreatedFilterWithValidation(
                          "launch_a_coin",
                          "preview",
                        )
                      }
                      className="flex h-8 w-full cursor-pointer items-center justify-between gap-x-2 rounded-[8px] border border-border bg-white/[3%] py-1 pl-2 pr-1 duration-300 hover:bg-white/[6%]"
                    >
                      <div className="flex items-center gap-x-2">
                        <div className="relative aspect-square h-5 w-5 flex-shrink-0">
                          <Image
                            src="/icons/asset/launch_a_coin.png"
                            alt="Launch a Coin Icon"
                            fill
                            quality={100}
                            className="object-contain"
                          />
                        </div>
                        <span className="inline-block text-nowrap text-sm text-fontColorPrimary">
                          Launch a Coin
                        </span>
                      </div>
                      <div className="relative aspect-square h-6 w-6 flex-shrink-0">
                        <Image
                          src={
                            checkBoxes?.launch_a_coin
                              ? "/icons/footer/checked.png"
                              : "/icons/footer/unchecked.png"
                          }
                          alt="Check / Unchecked Icon"
                          fill
                          quality={100}
                          className="object-contain"
                        />
                      </div>
                    </button>
                    <button
                      onClick={() =>
                        toggleNewlyCreatedFilterWithValidation(
                          "launchlab",
                          "preview",
                        )
                      }
                      className="flex h-8 w-full cursor-pointer items-center justify-between gap-x-2 rounded-[8px] border border-border bg-white/[3%] py-1 pl-2 pr-1 duration-300 hover:bg-white/[6%]"
                    >
                      <div className="flex items-center gap-x-2">
                        <div className="relative aspect-square h-5 w-5 flex-shrink-0">
                          <Image
                            src="/icons/asset/raydium.png"
                            alt="LaunchLab Icon"
                            fill
                            quality={100}
                            className="object-contain"
                          />
                        </div>
                        <span className="inline-block text-nowrap text-sm text-fontColorPrimary">
                          LaunchLab
                        </span>
                      </div>
                      <div className="relative aspect-square h-6 w-6 flex-shrink-0">
                        <Image
                          src={
                            checkBoxes?.launchlab
                              ? "/icons/footer/checked.png"
                              : "/icons/footer/unchecked.png"
                          }
                          alt="Check / Unchecked Icon"
                          fill
                          quality={100}
                          className="object-contain"
                        />
                      </div>
                    </button>
                    {/* <button
                      onClick={() =>
                        toggleNewlyCreatedFilterWithValidation("boop", "preview")
                      }
                      className="flex h-8 w-full cursor-pointer items-center justify-between gap-x-2 rounded-[8px] border border-border bg-white/[3%] py-1 pl-2 pr-1 duration-300 hover:bg-white/[6%]"
                    >
                      <div className="flex items-center gap-x-2">
                        <div className="relative aspect-square h-5 w-5 flex-shrink-0 overflow-hidden rounded-full">
                          <Image
                            src="/icons/asset/boop.png"
                            alt="Boop Icon"
                            fill
                            quality={100}
                            className="object-contain"
                          />
                        </div>
                        <span className="inline-block text-nowrap text-sm text-fontColorPrimary">
                          Boop
                        </span>
                      </div>
                      <div className="relative aspect-square h-6 w-6 flex-shrink-0">
                        <Image
                          src={
                            checkBoxes?.boop
                              ? "/icons/footer/checked.png"
                              : "/icons/footer/unchecked.png"
                          }
                          alt="Check / Unchecked Icon"
                          fill
                          quality={100}
                          className="object-contain"
                        />
                      </div>
                    </button> */}
                  </div>

                  {/* Show Hidden */}
                  <div className="flex w-full p-4">
                    <div className="flex w-full flex-col gap-y-1">
                      <Label
                        htmlFor="showhiddencoinsfilter"
                        className="justify-between text-nowrap text-sm text-fontColorSecondary"
                      >
                        Show Hidden Coins Filter
                      </Label>
                      <button
                        onClick={() =>
                          toggleNewlyCreatedFilterWithValidation(
                            "showHide",
                            "preview",
                          )
                        }
                        className="flex h-8 w-full cursor-pointer items-center justify-between gap-x-2 rounded-[8px] border border-border bg-white/[3%] py-1 pl-2 pr-1 duration-300 hover:bg-white/[6%]"
                      >
                        <div className="flex items-center">
                          <span className="inline-block text-nowrap text-sm text-fontColorPrimary">
                            Show Hidden Coins
                          </span>
                        </div>
                        <div className="relative aspect-square h-6 w-6 flex-shrink-0">
                          <Image
                            src={
                              checkBoxes?.showHide
                                ? "/icons/footer/checked.png"
                                : "/icons/footer/unchecked.png"
                            }
                            alt="Check / Unchecked Icon"
                            fill
                            quality={100}
                            className="object-contain"
                          />
                        </div>
                      </button>
                    </div>
                  </div>

                  <Separator />

                  {/* B. Symbol / Name */}
                  <div className="flex w-full justify-between gap-x-2 p-4">
                    <div className="flex flex-col gap-y-1">
                      <Label
                        htmlFor="showsymbolorname"
                        className="text-nowrap text-sm text-fontColorSecondary"
                      >
                        Symbol/Name
                      </Label>
                      <Input
                        id="showsymbolorname"
                        type="text"
                        value={showKeywords}
                        onChange={(e) =>
                          setShowKeywords(e.target.value, "preview")
                        }
                        placeholder="Enter Max 3 Keywords"
                        className="block h-8 w-full text-nowrap border-border bg-transparent text-sm text-fontColorPrimary placeholder:text-fontColorSecondary focus:outline-none focus:ring-0"
                      />
                    </div>

                    <div className="flex flex-col gap-y-1">
                      <Label
                        htmlFor="notshowsymbolorname"
                        className="text-nowrap text-sm text-fontColorSecondary"
                      >
                        Do not show Symbol/Name
                      </Label>
                      <Input
                        id="notshowsymbolorname"
                        type="text"
                        value={doNotShowKeywords}
                        onChange={(e) =>
                          setDoNotShowKeywords(e.target.value, "preview")
                        }
                        placeholder="Enter Max 3 Keywords"
                        className="block h-8 w-full text-nowrap border-border bg-transparent text-sm text-fontColorPrimary placeholder:text-fontColorSecondary focus:outline-none focus:ring-0"
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* C. By Range */}
                  <div className="flex w-full flex-col gap-y-4 p-4">
                    {/* By Market Cap */}
                    <div className="flex items-center gap-x-2">
                      <Label className="w-[80%] justify-between text-nowrap text-sm text-fontColorSecondary">
                        By Market Cap
                      </Label>
                      <div className="flex w-full items-center gap-x-2">
                        <Input
                          type="number"
                          value={byMarketCap?.min}
                          onChange={(e) =>
                            handleNormalValue("byMarketCap", e, "min")
                          }
                          placeholder="Min"
                          className="block h-8 w-full text-nowrap border-border bg-transparent text-sm text-fontColorPrimary placeholder:text-fontColorSecondary focus:outline-none focus:ring-0"
                        />
                        {/* <div className="flex-shrink-0 text-sm text-fontColorSecondary">
                      to
                    </div> */}
                        <Input
                          type="number"
                          value={byMarketCap?.max}
                          onChange={(e) =>
                            handleNormalValue("byMarketCap", e, "max")
                          }
                          placeholder="Max"
                          className="block h-8 w-full text-nowrap border-border bg-transparent text-sm text-fontColorPrimary placeholder:text-fontColorSecondary focus:outline-none focus:ring-0"
                        />
                      </div>
                    </div>

                    {/* By Holders Count */}
                    <div className="flex items-center gap-x-2">
                      <Label className="w-[80%] justify-between text-nowrap text-sm text-fontColorSecondary">
                        By Holders Count
                      </Label>
                      <div className="flex w-full items-center gap-x-2">
                        <Input
                          type="number"
                          value={byHoldersCount?.min}
                          onChange={(e) =>
                            handleNormalValue("byHoldersCount", e, "min")
                          }
                          placeholder="Min"
                          className="block h-8 w-full text-nowrap border-border bg-transparent text-sm text-fontColorPrimary placeholder:text-fontColorSecondary focus:outline-none focus:ring-0"
                        />
                        {/* <div className="flex-shrink-0 text-sm text-fontColorSecondary">
                      to
                    </div> */}
                        <Input
                          type="number"
                          value={byHoldersCount?.max}
                          onChange={(e) =>
                            handleNormalValue("byHoldersCount", e, "max")
                          }
                          placeholder="Max"
                          className="block h-8 w-full text-nowrap border-border bg-transparent text-sm text-fontColorPrimary placeholder:text-fontColorSecondary focus:outline-none focus:ring-0"
                        />
                      </div>
                    </div>

                    {/* By Top 10 Holders % */}
                    <div className="flex items-center gap-x-2">
                      <Label className="w-[80%] justify-between text-nowrap text-sm text-fontColorSecondary">
                        By Top 10 Holders %
                      </Label>
                      <div className="flex w-full items-center gap-x-2">
                        <Input
                          type="number"
                          value={byTop10Holders?.min}
                          onChange={(e) =>
                            handlePercentageValue("byTop10Holders", e, "min")
                          }
                          placeholder="Min"
                          className="block h-8 w-full text-nowrap border-border bg-transparent text-sm text-fontColorPrimary placeholder:text-fontColorSecondary focus:outline-none focus:ring-0"
                        />
                        <Input
                          type="number"
                          value={byTop10Holders?.max}
                          onChange={(e) =>
                            handlePercentageValue("byTop10Holders", e, "max")
                          }
                          placeholder="Max"
                          className="block h-8 w-full text-nowrap border-border bg-transparent text-sm text-fontColorPrimary placeholder:text-fontColorSecondary focus:outline-none focus:ring-0"
                        />
                      </div>
                    </div>

                    {/* By Dev Holding % */}
                    <div className="flex items-center gap-x-2">
                      <Label className="w-[80%] justify-between text-nowrap text-sm text-fontColorSecondary">
                        By Dev Holding %
                      </Label>
                      <div className="flex w-full items-center gap-x-2">
                        <div className="relative w-full">
                          <Input
                            type="number"
                            value={byDevHoldingPercentage?.min}
                            onChange={(e) =>
                              handlePercentageValue(
                                "byDevHoldingPercentage",
                                e,
                                "min",
                              )
                            }
                            placeholder="Min"
                            className="block h-8 w-full text-nowrap border-border bg-transparent text-sm text-fontColorPrimary placeholder:text-fontColorSecondary focus:outline-none focus:ring-0"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-fontColorSecondary">
                            %
                          </span>
                        </div>
                        {/* <div className="flex-shrink-0 text-sm text-fontColorSecondary">
                      to
                    </div> */}
                        <div className="relative w-full">
                          <Input
                            type="number"
                            value={byDevHoldingPercentage?.max}
                            onChange={(e) =>
                              handlePercentageValue(
                                "byDevHoldingPercentage",
                                e,
                                "max",
                              )
                            }
                            placeholder="Max"
                            className="block h-8 w-full text-nowrap border-border bg-transparent text-sm text-fontColorPrimary placeholder:text-fontColorSecondary focus:outline-none focus:ring-0"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-fontColorSecondary">
                            %
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* By Dev Migrated */}
                    <div className="flex items-center gap-x-2">
                      <Label className="w-[80%] justify-between text-nowrap text-sm text-fontColorSecondary">
                        By Dev Migrated
                      </Label>
                      <div className="flex w-full items-center gap-x-2">
                        <Input
                          type="number"
                          value={byDevMigrated?.min}
                          onChange={(e) =>
                            handleNormalValue("byDevMigrated", e, "min")
                          }
                          placeholder="Min"
                          className="block h-8 w-full text-nowrap border-border bg-transparent text-sm text-fontColorPrimary placeholder:text-fontColorSecondary focus:outline-none focus:ring-0"
                        />
                        {/* <div className="flex-shrink-0 text-sm text-fontColorSecondary">
                      to
                    </div> */}
                        <Input
                          type="number"
                          value={byDevMigrated?.max}
                          onChange={(e) =>
                            handleNormalValue("byDevMigrated", e, "max")
                          }
                          placeholder="Max"
                          className="block h-8 w-full text-nowrap border-border bg-transparent text-sm text-fontColorPrimary placeholder:text-fontColorSecondary focus:outline-none focus:ring-0"
                        />
                      </div>
                    </div>

                    {/* By Sniper */}
                    <div className="flex items-center gap-x-2">
                      <Label className="w-[80%] justify-between text-nowrap text-sm text-fontColorSecondary">
                        By Snipers
                      </Label>
                      <div className="flex w-full items-center gap-x-2">
                        <Input
                          type="number"
                          value={bySnipers?.min}
                          onChange={(e) =>
                            handleNormalValue("bySnipers", e, "min")
                          }
                          placeholder="Min"
                          className="block h-8 w-full text-nowrap border-border bg-transparent text-sm text-fontColorPrimary placeholder:text-fontColorSecondary focus:outline-none focus:ring-0"
                        />
                        {/* <div className="flex-shrink-0 text-sm text-fontColorSecondary">
                      to
                    </div> */}
                        <Input
                          type="number"
                          value={bySnipers?.max}
                          onChange={(e) =>
                            handleNormalValue("bySnipers", e, "max")
                          }
                          placeholder="Max"
                          className="block h-8 w-full text-nowrap border-border bg-transparent text-sm text-fontColorPrimary placeholder:text-fontColorSecondary focus:outline-none focus:ring-0"
                        />
                      </div>
                    </div>

                    {/* By Insider Holding % */}
                    <div className="flex items-center gap-x-2">
                      <Label className="w-[80%] justify-between text-nowrap text-sm text-fontColorSecondary">
                        By Insider Holding %
                      </Label>
                      <div className="flex w-full items-center gap-x-2">
                        <div className="relative w-full">
                          <Input
                            type="number"
                            value={byInsiderHoldingPercentage?.min}
                            onChange={(e) =>
                              handlePercentageValue(
                                "byInsiderHoldingPercentage",
                                e,
                                "min",
                              )
                            }
                            placeholder="Min"
                            className="block h-8 w-full text-nowrap border-border bg-transparent text-sm text-fontColorPrimary placeholder:text-fontColorSecondary focus:outline-none focus:ring-0"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-fontColorSecondary">
                            %
                          </span>
                        </div>
                        {/* <div className="flex-shrink-0 text-sm text-fontColorSecondary">
                      to
                    </div> */}
                        <div className="relative w-full">
                          <Input
                            type="number"
                            value={byInsiderHoldingPercentage?.max}
                            onChange={(e) =>
                              handlePercentageValue(
                                "byInsiderHoldingPercentage",
                                e,
                                "max",
                              )
                            }
                            placeholder="Max"
                            className="block h-8 w-full text-nowrap border-border bg-transparent text-sm text-fontColorPrimary placeholder:text-fontColorSecondary focus:outline-none focus:ring-0"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-fontColorSecondary">
                            %
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* By Bot Holders */}
                    <div className="flex items-center gap-x-2">
                      <Label className="w-[80%] justify-between text-nowrap text-sm text-fontColorSecondary">
                        By Bot Holders
                      </Label>
                      <div className="flex w-full items-center gap-x-2">
                        <Input
                          type="number"
                          value={byBotHolders?.min}
                          onChange={(e) =>
                            handleNormalValue("byBotHolders", e, "min")
                          }
                          placeholder="Min"
                          className="block h-8 w-full text-nowrap border-border bg-transparent text-sm text-fontColorPrimary placeholder:text-fontColorSecondary focus:outline-none focus:ring-0"
                        />
                        {/* <div className="flex-shrink-0 text-sm text-fontColorSecondary">
                      to
                    </div> */}
                        <Input
                          type="number"
                          value={byBotHolders?.max}
                          onChange={(e) =>
                            handleNormalValue("byBotHolders", e, "max")
                          }
                          placeholder="Max"
                          className="block h-8 w-full text-nowrap border-border bg-transparent text-sm text-fontColorPrimary placeholder:text-fontColorSecondary focus:outline-none focus:ring-0"
                        />
                      </div>
                    </div>

                    {/* By Age (Mins) */}
                    <div className="flex items-center gap-x-2">
                      <Label className="w-[80%] justify-between text-nowrap text-sm text-fontColorSecondary">
                        By Age (Mins)
                      </Label>
                      <div className="flex w-full items-center gap-x-2">
                        <Input
                          type="number"
                          value={byAge?.min}
                          onChange={(e) => handleNormalValue("byAge", e, "min")}
                          placeholder="Min"
                          className="block h-8 w-full text-nowrap border-border bg-transparent text-sm text-fontColorPrimary placeholder:text-fontColorSecondary focus:outline-none focus:ring-0"
                        />
                        {/* <div className="flex-shrink-0 text-sm text-fontColorSecondary">
                      to
                    </div> */}
                        <Input
                          type="number"
                          value={byAge?.max}
                          onChange={(e) => handleNormalValue("byAge", e, "max")}
                          placeholder="Max"
                          className="block h-8 w-full text-nowrap border-border bg-transparent text-sm text-fontColorPrimary placeholder:text-fontColorSecondary focus:outline-none focus:ring-0"
                        />
                      </div>
                    </div>

                    {/* By Current Liquidity($) */}
                    <div className="flex items-center gap-x-2">
                      <Label className="w-[80%] justify-between text-nowrap text-sm text-fontColorSecondary">
                        By Current Liquidity($)
                      </Label>
                      <div className="flex w-full items-center gap-x-2">
                        <Input
                          type="number"
                          value={byCurrentLiquidity?.min}
                          onChange={(e) =>
                            handleNormalValue("byCurrentLiquidity", e, "min")
                          }
                          placeholder="Min"
                          className="block h-8 w-full text-nowrap border-border bg-transparent text-sm text-fontColorPrimary placeholder:text-fontColorSecondary focus:outline-none focus:ring-0"
                        />
                        {/* <div className="flex-shrink-0 text-sm text-fontColorSecondary">
                      to
                    </div> */}
                        <Input
                          type="number"
                          value={byCurrentLiquidity?.max}
                          onChange={(e) =>
                            handleNormalValue("byCurrentLiquidity", e, "max")
                          }
                          placeholder="Max"
                          className="block h-8 w-full text-nowrap border-border bg-transparent text-sm text-fontColorPrimary placeholder:text-fontColorSecondary focus:outline-none focus:ring-0"
                        />
                      </div>
                    </div>

                    {/* By Volume */}
                    <div className="flex items-center gap-x-2">
                      <Label className="w-[80%] justify-between text-nowrap text-sm text-fontColorSecondary">
                        By Volume
                      </Label>
                      <div className="flex w-full items-center gap-x-2">
                        <Input
                          type="number"
                          value={byVolume?.min}
                          onChange={(e) =>
                            handleNormalValue("byVolume", e, "min")
                          }
                          placeholder="Min"
                          className="block h-8 w-full text-nowrap border-border bg-transparent text-sm text-fontColorPrimary placeholder:text-fontColorSecondary focus:outline-none focus:ring-0"
                        />
                        {/* <div className="flex-shrink-0 text-sm text-fontColorSecondary">
                      to
                    </div> */}
                        <Input
                          type="number"
                          value={byVolume?.max}
                          onChange={(e) =>
                            handleNormalValue("byVolume", e, "max")
                          }
                          placeholder="Max"
                          className="block h-8 w-full text-nowrap border-border bg-transparent text-sm text-fontColorPrimary placeholder:text-fontColorSecondary focus:outline-none focus:ring-0"
                        />
                      </div>
                    </div>

                    {/* By TXNS */}
                    <div className="flex items-center gap-x-2">
                      <Label className="w-[80%] justify-between text-nowrap text-sm text-fontColorSecondary">
                        By TXNS
                      </Label>
                      <div className="flex w-full items-center gap-x-2">
                        <Input
                          type="number"
                          value={byTXNS?.min}
                          onChange={(e) =>
                            handleNormalValue("byTXNS", e, "min")
                          }
                          placeholder="Min"
                          className="block h-8 w-full text-nowrap border-border bg-transparent text-sm text-fontColorPrimary placeholder:text-fontColorSecondary focus:outline-none focus:ring-0"
                        />
                        {/* <div className="flex-shrink-0 text-sm text-fontColorSecondary">
                      to
                    </div> */}
                        <Input
                          type="number"
                          value={byTXNS?.max}
                          onChange={(e) =>
                            handleNormalValue("byTXNS", e, "max")
                          }
                          placeholder="Max"
                          className="block h-8 w-full text-nowrap border-border bg-transparent text-sm text-fontColorPrimary placeholder:text-fontColorSecondary focus:outline-none focus:ring-0"
                        />
                      </div>
                    </div>

                    {/* By Buys */}
                    <div className="flex items-center gap-x-2">
                      <Label className="w-[80%] justify-between text-nowrap text-sm text-fontColorSecondary">
                        By Buys
                      </Label>
                      <div className="flex w-full items-center gap-x-2">
                        <Input
                          type="number"
                          value={byBuys?.min}
                          onChange={(e) =>
                            handleNormalValue("byBuys", e, "min")
                          }
                          placeholder="Min"
                          className="block h-8 w-full text-nowrap border-border bg-transparent text-sm text-fontColorPrimary placeholder:text-fontColorSecondary focus:outline-none focus:ring-0"
                        />
                        {/* <div className="flex-shrink-0 text-sm text-fontColorSecondary">
                      to
                    </div> */}
                        <Input
                          type="number"
                          value={byBuys?.max}
                          onChange={(e) =>
                            handleNormalValue("byBuys", e, "max")
                          }
                          placeholder="Max"
                          className="block h-8 w-full text-nowrap border-border bg-transparent text-sm text-fontColorPrimary placeholder:text-fontColorSecondary focus:outline-none focus:ring-0"
                        />
                      </div>
                    </div>

                    {/* By Sells */}
                    <div className="flex items-center gap-x-2">
                      <Label className="w-[80%] justify-between text-nowrap text-sm text-fontColorSecondary">
                        By Sells
                      </Label>
                      <div className="flex w-full items-center gap-x-2">
                        <Input
                          type="number"
                          value={bySells?.min}
                          onChange={(e) =>
                            handleNormalValue("bySells", e, "min")
                          }
                          placeholder="Min"
                          className="block h-8 w-full text-nowrap border-border bg-transparent text-sm text-fontColorPrimary placeholder:text-fontColorSecondary focus:outline-none focus:ring-0"
                        />
                        {/* <div className="flex-shrink-0 text-sm text-fontColorSecondary">
                      to
                    </div> */}
                        <Input
                          type="number"
                          value={bySells?.max}
                          onChange={(e) =>
                            handleNormalValue("bySells", e, "max")
                          }
                          placeholder="Max"
                          className="block h-8 w-full text-nowrap border-border bg-transparent text-sm text-fontColorPrimary placeholder:text-fontColorSecondary focus:outline-none focus:ring-0"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="absolute bottom-0 left-0 flex h-[64px] w-full items-center justify-between gap-x-3 border-t border-border bg-[#080811] p-4">
              <button
                onClick={handleResetFilter}
                className="font-geistSemiBold text-sm text-primary duration-300 hover:text-[#be7ad2]"
              >
                Reset
              </button>
              <button
                onClick={handleApplyFilter}
                className="flex items-center justify-center text-nowrap rounded-[8px] bg-primary px-10 py-2 font-geistSemiBold text-sm text-[#080811] duration-300 hover:bg-[#be7ad2]"
              >
                Apply
              </button>
            </div>
          </DrawerContent>
        </Drawer>
      </>
    );
  },
);

NewlyCreatedListFilterPopover.displayName = "NewlyCreatedListFilterPopover";

export default NewlyCreatedListFilterPopover;
