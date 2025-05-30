"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import { useState, useEffect, useRef } from "react";
import { useHoldingsFilterStore } from "@/stores/dex-setting/use-holdings-filter.store";
import { useUserWalletStore } from "@/stores/wallet/use-user-wallet.store";
import { useQuickAmountStore } from "@/stores/dex-setting/use-quick-amount.store";
import { useActivePresetStore } from "@/stores/dex-setting/use-active-preset.store";
import { useMoreFilterStore } from "@/stores/dex-setting/use-more-filter.store";
import { useHoldingsHideStore } from "@/stores/holdings/use-holdings-hide.store";
import { useHoldingsSearchStore } from "@/stores/holdings/use-holdings-search.store";
import { useQuickBuySettingsStore } from "@/stores/setting/use-quick-buy-settings.store";
import { useWalletTrackerStore } from "@/stores/footer/use-wallet-tracker";
import { useSnapStateStore } from "@/stores/use-snap-state";
import { useDebouncedQuickBuy } from "@/hooks/use-debounced-quickbuy";
// ######## Components 🧩 ########
import Image from "next/image";
import { Input } from "@/components/ui/input";
import BaseButton from "@/components/customs/buttons/BaseButton";
import WalletSelectionButton from "@/components/customs/WalletSelectionButton";
import PresetSelectionButtons from "@/components/customs/PresetSelectionButtons";
import Separator from "@/components/customs/Separator";
import QuickAmountInput from "@/components/customs/QuickAmountInput";
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
  DrawerTrigger,
} from "@/components/ui/drawer";
import TrendingDexesFilterPopover from "@/components/customs/popovers/TrendingDexesFilterPopover";
import TrendingFilterPopover from "@/components/customs/popovers/TrendingFilterPopover";
import WalletTrackerFilter from "@/components/customs/WalletTrackerFilter";
// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";
import VolumePopover from "./VolumePopover";
import NotificationPopover from "./NotificationPopover";
import { useWindowSizeStore } from "@/stores/use-window-size.store";
import { Paused } from "./cards/partials/Paused";
import { useWalletTrackerPaused } from "@/stores/footer/use-wallet-tracker-paused";

const ADD_WALLET_CONTENT_CONTAINER_BASE_CLASS =
  "border-2 border-border bg-card p-0 shadow-[0_0_20px_0_#000000] max-w-[95vw] sm:w-[518px] flex flex-col h-[496px] md:h-[480px] z-[1000]";
const ADD_WALLET_CONTENT_CONTAINER_BASE_CLASS_2 =
  "border-2 border-border bg-card p-0 shadow-[0_0_20px_0_#000000] max-w-[95vw] sm:w-[518px] flex flex-col h-auto z-[1000]";

export default function DexBuySettings({
  variant,
}: {
  variant:
    | "Cosmo"
    | "Trending"
    | "Holdings"
    | "Wallet Tracker"
    | "Twitter Monitor"
    | "Twitter Monitor Footer"
    | "Twitter Monitor Pop Up"
    | "Pop Up";
}) {
  const { debouncedUpdateQuickBuyAmount } = useDebouncedQuickBuy();

  const width = useWindowSizeStore((state) => state.width);

  const isFetchedSettings = !!useQuickBuySettingsStore((state) => state.presets)
    ?.preset1;

  // Dex Buy Setting State ✨
  const withRemainingTokensPreview = useHoldingsFilterStore(
    (state) => state.filters.preview.withRemainingTokens,
  );
  const withRemainingTokensGenuine = useHoldingsFilterStore(
    (state) => state.filters.genuine.withRemainingTokens,
  );
  const {
    filters,
    // toggleWithRemainingTokens,
    setWithRemainingTokens,
    resetHoldingsFilters,
    applyHoldingsFilters,
  } = useHoldingsFilterStore();
  const { isShowHiddenToken, setIsShowHiddenToken } = useHoldingsHideStore();
  const cosmoWallets = useQuickAmountStore((state) => state.cosmoWallets);
  const setCosmoWallets = useQuickAmountStore((state) => state.setCosmoWallets);
  const setCosmoQuickBuyAmount = useQuickAmountStore(
    (state) => state.setCosmoQuickBuyAmount,
  );
  const cosmoQuickBuyAmount = useQuickAmountStore(
    (state) => state.cosmoQuickBuyAmount,
  );

  const presetData = useQuickBuySettingsStore((state) => state.presets);
  const { cosmoActivePreset, setCosmoActivePreset } = useActivePresetStore();
  const { searchQuery, setSearchQuery } = useHoldingsSearchStore();

  const { userWalletFullList } = useUserWalletStore();
  const favoritedWallet = userWalletFullList?.filter((w) => w.selected);
  const { setIsLoadingFilterFetch } = useMoreFilterStore();

  const [openEditPopover, setOpenEditPopover] = useState<boolean>(false);
  const [openEditDialog, setOpenEditDialog] = useState<boolean>(false);
  const handleCloseEditForm = () => {
    setOpenEditPopover(false);
    setOpenEditDialog(false);
  };
  const [openAddPopover, setOpenAddPopover] = useState<boolean>(false);
  const [openAddDialog, setOpenAddDialog] = useState<boolean>(false);
  const handleCloseAddForm = () => {
    setOpenAddPopover(false);
    setOpenAddDialog(false);
  };

  // Modal & Drawer State ✨
  const [openHoldingsFilterPopover, setOpenHoldingsFilterPopover] =
    useState<boolean>(false);
  const [openHoldingsFilterDrawer, setOpenHoldingsFilterDrawer] =
    useState<boolean>(false);

  const [tempWithRemainingTokens, setTempWithRemainingTokens] = useState(
    filters.preview.withRemainingTokens,
  );

  useEffect(() => {
    if (openHoldingsFilterPopover || openHoldingsFilterDrawer) {
      setTempWithRemainingTokens(filters.preview.withRemainingTokens);
    }
  }, [openHoldingsFilterPopover, openHoldingsFilterDrawer]);

  const customSetOpenFilterPopover = (isOpen: boolean) => {
    setOpenHoldingsFilterPopover(isOpen);
    if (
      JSON.stringify({
        withRemainingTokensPreview,
      }) !==
      JSON.stringify({
        withRemainingTokensGenuine,
      })
    ) {
      handleApplyFilter();
    }
  };
  const customSetOpenFilterDrawer = (isOpen: boolean) => {
    setOpenHoldingsFilterDrawer(isOpen);
    if (
      JSON.stringify({
        withRemainingTokensPreview,
      }) !==
      JSON.stringify({
        withRemainingTokensGenuine,
      })
    ) {
      handleApplyFilter();
    }
  };
  useEffect(() => {
    if (width! >= 1280 && openHoldingsFilterDrawer) {
      setOpenHoldingsFilterDrawer(false);
    } else if (width! < 1280 && openHoldingsFilterPopover) {
      setOpenHoldingsFilterPopover(false);
    }
  }, [width]);
  const handleResetFilter = () => {
    setIsLoadingFilterFetch(true);

    resetHoldingsFilters("genuine");
    resetHoldingsFilters("preview");
    setOpenHoldingsFilterPopover(false);
    setOpenHoldingsFilterDrawer(false);
  };
  const handleApplyFilter = () => {
    setIsLoadingFilterFetch(true);
    setWithRemainingTokens("preview", tempWithRemainingTokens);
    applyHoldingsFilters();
    setOpenHoldingsFilterPopover(false);
    setOpenHoldingsFilterDrawer(false);
  };

  const isWalletTrackerHovered = useWalletTrackerPaused(
    (state) => state.isWalletTrackerHovered,
  );

  const currentSnapped = useSnapStateStore((state) => state.currentSnapped);

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-2 gap-y-2 min-[1340px]:gap-x-2",
        currentSnapped.side === "none" ? "justify-end" : "justify-start",
      )}
    >
      {variant === "Trending" && (
        <>
          <div className="flex w-full flex-shrink-0 items-center justify-start gap-2 xl:w-fit xl:flex-nowrap xl:justify-end">
            <TrendingDexesFilterPopover />

            <TrendingFilterPopover />

            <QuickAmountInput
              isLoading={!isFetchedSettings}
              // value={cosmoQuickBuyAmount}
              // onChange={(val) => {
              //   if (Number(val) >= 0.00001) {
              //     setCosmoQuickBuyAmount(val);
              //     debouncedUpdateQuickBuyAmount({
              //       amount: val,
              //       type: "cosmo",
              //     });
              //   }
              // }}
              className="flex !w-full !max-w-[160px] lg:hidden"
              classNameChildren="!w-full"
              // width={155}
            />
          </div>

          <Separator
            color="#2E2E47"
            orientation="vertical"
            unit="fixed"
            fixedHeight={20}
            className="hidden min-[1428.9px]:block"
          />
        </>
      )}

      {variant === "Holdings" && (
        <div className="flex w-full flex-wrap items-center gap-2 xl:w-auto xl:flex-nowrap xl:pl-2">
          <div className="flex w-full items-start gap-2 max-md:flex-col">
            <div className="flex items-center gap-x-2">
              <QuickAmountInput
                isLoading={!isFetchedSettings}
                // value={cosmoQuickBuyAmount}
                // onChange={(val) => {
                //   if (Number(val) >= 0.00001) {
                //     setCosmoQuickBuyAmount(val);
                //     debouncedUpdateQuickBuyAmount({
                //       amount: val,
                //       type: "cosmo",
                //     });
                //   }
                // }}
                width={width! >= 1280 ? undefined : 138}
                className={cn("flex !w-full min-w-[70px] max-w-[150px]")}
                classNameChildren="!w-full"
              />

              <div className="flex w-fit items-center gap-x-2">
                <PresetSelectionButtons isWithSetting />

                <div className="hidden h-[32px] flex-shrink-0 items-center lg:flex">
                  <WalletSelectionButton
                    value={cosmoWallets}
                    setValue={setCosmoWallets}
                    isReplaceWhenEmpty={false}
                    maxWalletShow={10}
                    displayVariant="name"
                    className="h-[32px]"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-x-2">
              <div className="w-full max-w-[318px] xl:w-fit">
                <Input
                  id="search-holdings"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  prefixEl={
                    <div className="absolute left-3 top-1/2 z-10 aspect-square h-4 w-4 flex-shrink-0 -translate-y-1/2">
                      <Image
                        src="/icons/search-input.png"
                        alt="Search Icon"
                        fill
                        quality={100}
                        className="object-contain"
                      />
                    </div>
                  }
                />
              </div>

              <div className="flex h-[32px] w-[90px] flex-shrink-0 items-center md:w-[120px] lg:hidden">
                <WalletSelectionButton
                  value={cosmoWallets}
                  setValue={setCosmoWallets}
                  isReplaceWhenEmpty={false}
                  maxWalletShow={10}
                  displayVariant="name"
                />
              </div>

              <BaseButton
                onClick={() => setIsShowHiddenToken(!isShowHiddenToken)}
                variant="gray"
                size="short"
                className="aspect-square size-[30px]"
              >
                <div className="relative z-30 aspect-square h-4 w-4 flex-shrink-0">
                  <Image
                    src={
                      isShowHiddenToken
                        ? "/icons/hide.png"
                        : "/icons/unhide.png"
                    }
                    alt="Hide / Unhide Icon"
                    fill
                    quality={100}
                    className="object-contain"
                  />
                </div>
              </BaseButton>

              {/* Desktop */}
              <Popover
                open={openHoldingsFilterPopover}
                onOpenChange={customSetOpenFilterPopover}
              >
                <PopoverTrigger asChild>
                  <div id="holdings-filter-button" className="hidden lg:flex">
                    <FilterButton
                      handleOpen={() =>
                        setOpenHoldingsFilterPopover((prev) => !prev)
                      }
                      isActive={openHoldingsFilterPopover}
                      text="Filters"
                      className="hidden h-8 pl-2.5 pr-3 text-sm lg:flex"
                    />
                  </div>
                </PopoverTrigger>
                <PopoverContent
                  align="end"
                  sideOffset={8}
                  className="gb__white__popover relative hidden h-auto w-[320px] flex-col border border-border bg-card p-0 shadow-[0_10px_20px_0_rgba(0,0,0,1)] lg:flex"
                >
                  <div className="flex h-[56px] flex-row items-center justify-between border-b border-border p-4">
                    <h4 className="font-geistSemiBold text-lg text-fontColorPrimary">
                      Filter
                    </h4>
                    <button
                      title="Close"
                      onClick={() =>
                        setOpenHoldingsFilterPopover((prev) => !prev)
                      }
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
                  <div className="flex w-full flex-col gap-y-2 p-4">
                    <div
                      // onClick={() => toggleWithRemainingTokens("preview")}
                      onClick={() =>
                        setTempWithRemainingTokens((prev) => !prev)
                      }
                      className="flex h-8 w-full cursor-pointer items-center justify-between gap-x-2 rounded-[8px] border border-border py-1 pl-2 pr-1"
                    >
                      <span className="inline-block text-nowrap font-geistLight text-sm text-fontColorPrimary">
                        With remaining tokens
                      </span>
                      <div className="relative aspect-square h-6 w-6 flex-shrink-0">
                        <Image
                          src={
                            tempWithRemainingTokens
                              ? "/icons/footer/checked.png"
                              : "/icons/footer/unchecked.png"
                          }
                          alt="Check / Unchecked Icon"
                          fill
                          quality={100}
                          className="object-contain"
                        />
                      </div>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="flex h-[64px] w-full items-center justify-between gap-x-3 border-t border-border p-4">
                    <button
                      onClick={handleResetFilter}
                      className="font-geistSemiBold text-sm text-primary duration-300 hover:text-[#be7ad2]"
                    >
                      Reset
                    </button>
                    <BaseButton
                      onClick={handleApplyFilter}
                      variant="primary"
                      className="h-8 px-10"
                    >
                      <span className="font-geistSemiBold text-sm">Apply</span>
                    </BaseButton>
                  </div>
                </PopoverContent>
              </Popover>

              {/* Mobile */}
              <Drawer
                open={openHoldingsFilterDrawer}
                onOpenChange={customSetOpenFilterDrawer}
              >
                <DrawerTrigger asChild>
                  <div
                    id="holdings-filter-button-mobile"
                    className="flex lg:hidden"
                  >
                    <FilterButton
                      handleOpen={() =>
                        setOpenHoldingsFilterDrawer((prev) => !prev)
                      }
                      isActive={openHoldingsFilterDrawer}
                      text=""
                      suffixEl={
                        <div className="flex h-[17px] w-[16px] items-center justify-center rounded-[5px] bg-success px-1">
                          <span className="font-geistSemiBold text-xs text-[#080811]">
                            {withRemainingTokensGenuine ? 1 : 0}
                          </span>
                        </div>
                      }
                      className="flex h-8 pl-2.5 pr-3 text-sm lg:hidden"
                    />
                  </div>
                </DrawerTrigger>
                <DrawerContent>
                  <DrawerHeader className="flex h-[56px] flex-row items-center justify-between border-b border-border p-4">
                    <DrawerTitle className="text-lg">Filter</DrawerTitle>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={handleResetFilter}
                        className="font-geistSemiBold text-sm text-fontColorSecondary duration-300 hover:text-fontColorPrimary/85"
                      >
                        Reset
                      </button>
                      <button
                        title="Close"
                        onClick={() =>
                          setOpenHoldingsFilterDrawer((prev) => !prev)
                        }
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
                  </DrawerHeader>

                  {/* Fields */}
                  <div className="flex w-full flex-col gap-y-2 p-4">
                    <div
                      // onClick={() => toggleWithRemainingTokens("preview")}
                      onClick={() =>
                        setTempWithRemainingTokens((prev) => !prev)
                      }
                      className="flex h-[56px] w-full cursor-pointer items-center justify-between gap-x-2 rounded-[8px] bg-white/[4%] py-3 pl-3 pr-4"
                    >
                      <span className="inline-block text-nowrap font-geistSemiBold text-base text-fontColorPrimary">
                        With remaining tokens
                      </span>
                      <div className="relative aspect-square h-6 w-6 flex-shrink-0">
                        <Image
                          src={
                            tempWithRemainingTokens
                              ? "/icons/footer/checked.png"
                              : "/icons/footer/unchecked.png"
                          }
                          alt="Check / Unchecked Icon"
                          fill
                          quality={100}
                          className="object-contain"
                        />
                      </div>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="flex h-[64px] w-full items-center justify-between gap-x-3 border-t border-border p-4">
                    <BaseButton
                      onClick={handleApplyFilter}
                      variant="primary"
                      className="h-10 w-full px-10 xl:h-8"
                    >
                      <span className="font-geistSemiBold text-base xl:text-sm">
                        Apply
                      </span>
                    </BaseButton>
                  </div>
                </DrawerContent>
              </Drawer>
            </div>
          </div>
        </div>
      )}

      {["Cosmo", "Trending"].includes(variant) && (
        <div
          className={`flex w-full ${variant === "Trending" ? "flex-nowrap" : "flex-wrap"} items-center gap-x-2 gap-y-2 xl:w-fit xl:flex-shrink-0 xl:flex-nowrap`}
        >
          {variant === "Trending" && (
            <>
              {/* Desktop */}
              <QuickAmountInput
                isLoading={!isFetchedSettings}
                // value={cosmoQuickBuyAmount}
                // onChange={(val) => {
                //   if (Number(val) >= 0.00001) {
                //     setCosmoQuickBuyAmount(val);
                //     debouncedUpdateQuickBuyAmount({
                //       amount: val,
                //       type: "cosmo",
                //     });
                //   }
                // }}
                className="hidden lg:flex"
              />

              {/* Desktop */}
              <div className="hidden lg:flex">
                <PresetSelectionButtons isWithLabel isWithSetting />
              </div>
              {/* Mobile */}
              <div className="flex lg:hidden">
                <PresetSelectionButtons isWithLabel={false} isWithSetting />
              </div>

              {/* Desktop */}
              <div className="hidden h-[32px] flex-shrink-0 items-center lg:flex">
                <WalletSelectionButton
                  value={cosmoWallets}
                  setValue={setCosmoWallets}
                  isReplaceWhenEmpty={false}
                  maxWalletShow={3}
                  className="h-[32px]"
                />
              </div>
              {/* Mobile */}
              <div className="flex h-[32px] w-full max-w-[206px] items-center lg:hidden">
                <WalletSelectionButton
                  value={cosmoWallets}
                  setValue={setCosmoWallets}
                  isReplaceWhenEmpty={false}
                  maxWalletShow={2}
                  className="w-full"
                />
              </div>
            </>
          )}

          {variant === "Cosmo" && (
            <>
              <div className="flex flex-wrap gap-x-2 gap-y-2 max-md:w-full">
                <QuickAmountInput
                  isLoading={!isFetchedSettings}
                  // value={cosmoQuickBuyAmount}
                  // onChange={(val) => {
                  //   if (Number(val) >= 0.00001) {
                  //     setCosmoQuickBuyAmount(val);
                  //     debouncedUpdateQuickBuyAmount({
                  //       amount: val,
                  //       type: "cosmo",
                  //     });
                  //   }
                  // }}
                  width={width! >= 1280 ? undefined : 138}
                  className="flex max-lg:!w-full max-lg:max-w-[150px]"
                  classNameChildren="!w-full"
                />

                <div className="w-fit">
                  <PresetSelectionButtons isWithLabel isWithSetting />
                </div>
              </div>

              {/* Desktop */}
              <div className="hidden h-[32px] flex-shrink-0 items-center xl:flex">
                <WalletSelectionButton
                  value={cosmoWallets}
                  setValue={setCosmoWallets}
                  isReplaceWhenEmpty={false}
                  maxWalletShow={10}
                  displayVariant="name"
                  className="h-[32px]"
                />
              </div>
              {/* Mobile */}
              <div className="flex h-[32px] w-full max-w-[413px] flex-shrink-0 items-center xl:hidden">
                <WalletSelectionButton
                  className="h-[32px] w-full"
                  value={cosmoWallets}
                  setValue={setCosmoWallets}
                  maxWalletShow={10}
                  isReplaceWhenEmpty={false}
                />
              </div>
            </>
          )}
        </div>
      )}

      {variant === "Twitter Monitor" && (
        <div className="flex w-full flex-wrap items-center justify-start gap-2">
          <div className="flex gap-x-2 max-md:w-full">
            <QuickAmountInput
              isLoading={!isFetchedSettings}
              // value={cosmoQuickBuyAmount}
              // onChange={(val) => {
              //   if (Number(val) >= 0.00001) {
              //     setCosmoQuickBuyAmount(val);
              //     debouncedUpdateQuickBuyAmount({
              //       amount: val,
              //       type: "cosmo",
              //     });
              //   }
              // }}
              width={width! >= 1280 ? undefined : 138}
              className={cn("flex !w-full max-w-[150px]")}
              classNameChildren="!w-full"
            />

            <div className="flex w-fit items-center gap-x-2">
              <PresetSelectionButtons isWithSetting />

              {variant === "Twitter Monitor" && (
                <div className="hidden h-[32px] flex-shrink-0 items-center xl:flex">
                  <WalletSelectionButton
                    value={cosmoWallets}
                    setValue={setCosmoWallets}
                    isReplaceWhenEmpty={false}
                    maxWalletShow={10}
                    displayVariant="name"
                    className="h-[32px]"
                  />
                </div>
              )}
            </div>
          </div>

          {variant === "Twitter Monitor" && (
            <div className="block w-full xl:hidden [&_#wallet-selection-button]:w-full">
              <WalletSelectionButton
                value={cosmoWallets}
                setValue={setCosmoWallets}
                isReplaceWhenEmpty={false}
                maxWalletShow={10}
                displayVariant="name"
                className="h-full"
              />
            </div>
          )}

          {/* Desktop */}
          {/*<div className="hidden h-[32px] max-w-[360px] flex-shrink-0 flex-grow xl:flex">*/}
          {/*  <WalletSelectionButton*/}
          {/*    value={cosmoWallets}*/}
          {/*    setValue={setCosmoWallets}*/}
          {/*    isReplaceWhenEmpty={false}*/}
          {/*    maxWalletShow={10}*/}
          {/*    displayVariant="name"*/}
          {/*  />*/}
          {/*</div>*/}
          {/* Mobile */}
          {/*<div className="flex h-[32px] w-full max-w-[413px] flex-shrink-0 items-center xl:hidden">*/}
          {/*  <WalletSelectionButton*/}
          {/*    className="w-full"*/}
          {/*    value={cosmoWallets}*/}
          {/*    setValue={setCosmoWallets}*/}
          {/*    maxWalletShow={10}*/}
          {/*    isReplaceWhenEmpty={false}*/}
          {/*  />*/}
          {/*</div>*/}
        </div>
      )}

      {variant === "Twitter Monitor Footer" && (
        <div className="flex w-full flex-wrap items-center justify-start gap-2">
          <div className="flex gap-x-2 max-md:w-full">
            <QuickAmountInput
              isLoading={!isFetchedSettings}
              // value={cosmoQuickBuyAmount}
              // onChange={(val) => {
              //   if (Number(val) >= 0.00001) {
              //     setCosmoQuickBuyAmount(val);
              //     debouncedUpdateQuickBuyAmount({
              //       amount: val,
              //       type: "cosmo",
              //     });
              //   }
              // }}
              classNameChildren="!w-full"
            />

            <div className="flex w-fit items-center gap-x-2">
              <PresetSelectionButtons isWithSetting />
            </div>
          </div>
        </div>
      )}

      {variant === "Pop Up" && (
        <div className="flex w-full flex-wrap items-center justify-start gap-2">
          <div className="flex max-w-sm gap-x-2 max-md:w-full">
            <QuickAmountInput
              isLoading={!isFetchedSettings}
              // value={cosmoQuickBuyAmount}
              // onChange={(val) => {
              //   setCosmoQuickBuyAmount(val);
              //   debouncedUpdateQuickBuyAmount({
              //     amount: val,
              //     type: "cosmo",
              //   });
              // }}
              // width={120}
              classNameChildren="w-full"
            />

            <div className="w-fit">
              <PresetSelectionButtons isWithLabel isWithSetting />
            </div>
          </div>

          {/* Desktop */}
          {/*<div className="hidden h-[32px] max-w-sm flex-shrink-0 flex-grow xl:flex">*/}
          {/*  <WalletSelectionButton*/}
          {/*    value={cosmoWallets}*/}
          {/*    setValue={setCosmoWallets}*/}
          {/*    isReplaceWhenEmpty={false}*/}
          {/*    maxWalletShow={10}*/}
          {/*    displayVariant="name"*/}
          {/*  />*/}
          {/*</div>*/}
        </div>
      )}

      {variant === "Twitter Monitor Pop Up" && (
        <div className="flex w-full flex-wrap items-center justify-start gap-2">
          <div className="flex gap-x-2 max-md:w-full">
            <QuickAmountInput
              isLoading={!isFetchedSettings}
              // value={cosmoQuickBuyAmount}
              // onChange={(val) => {
              //   setCosmoQuickBuyAmount(val);
              //   debouncedUpdateQuickBuyAmount({
              //     amount: val,
              //     type: "cosmo",
              //   });
              // }}
              // width={120}
              classNameChildren="w-full"
            />

            <div className="w-fit">
              <PresetSelectionButtons isWithSetting />
            </div>
          </div>

          {/* Desktop */}
          {/*<div className="hidden h-[32px] max-w-sm flex-shrink-0 flex-grow xl:flex">*/}
          {/*  <WalletSelectionButton*/}
          {/*    value={cosmoWallets}*/}
          {/*    setValue={setCosmoWallets}*/}
          {/*    isReplaceWhenEmpty={false}*/}
          {/*    maxWalletShow={10}*/}
          {/*    displayVariant="name"*/}
          {/*  />*/}
          {/*</div>*/}
        </div>
      )}

      {variant === "Wallet Tracker" && (
        <div className="flex w-full items-center gap-x-3">
          <div className="flex w-full items-start gap-2 max-md:flex-col md:items-center">
            {width! >= 1280 && (
              <div className="hidden md:flex">
                <NotificationPopover />
              </div>
            )}

            <div className="hidden lg:flex">
              <VolumePopover />
            </div>

            {/* Desktop */}
            <div className="hidden h-[32px] flex-shrink-0 items-center lg:flex">
              <WalletSelectionButton
                value={cosmoWallets}
                setValue={setCosmoWallets}
                isReplaceWhenEmpty={false}
                maxWalletShow={10}
              />
            </div>

            {/* Mobile */}
            <div className="flex h-[32px] w-full max-w-[413px] flex-shrink-0 items-center gap-x-2 lg:hidden">
              {isWalletTrackerHovered && (
                <Paused
                  separatorProps={{
                    className: "hidden",
                  }}
                  className="block w-8 lg:hidden"
                />
              )}

              <VolumePopover isMobile />
              <WalletSelectionButton
                value={cosmoWallets}
                setValue={setCosmoWallets}
                isReplaceWhenEmpty={false}
                maxWalletShow={10}
              />
            </div>

            <div className="flex w-full justify-start gap-x-2">
              <QuickAmountInput
                isLoading={!isFetchedSettings}
                // value={cosmoQuickBuyAmount}
                // onChange={(val) => {
                //   if (Number(val) >= 0.00001) {
                //     setCosmoQuickBuyAmount(val);
                //     debouncedUpdateQuickBuyAmount({
                //       amount: val,
                //       type: "cosmo",
                //     });
                //   }
                // }}
                width={width! >= 1280 ? undefined : 138}
                className="flex max-xl:!w-full max-xl:max-w-[224px]"
                classNameChildren="!w-full"
              />
              <div className="w-fit">
                <PresetSelectionButtons isWithSetting />
              </div>

              <WalletTrackerFilter />
              <WalletTrackerFilter isMobile />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
