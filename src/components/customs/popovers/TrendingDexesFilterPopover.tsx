"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import { useState, useEffect } from "react";
import { useDexesFilterStore } from "@/stores/dex-setting/use-dexes-filter.store";
import { useMoreFilterStore } from "@/stores/dex-setting/use-more-filter.store";
// ######## Components 🧩 ########
import Image from "next/image";
import BaseButton from "@/components/customs/buttons/BaseButton";
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
import { useWindowSizeStore } from "@/stores/use-window-size.store";

export default function TrendingDexesFilterPopover() {
  const { setIsLoadingFilterFetch } = useMoreFilterStore();

  const width = useWindowSizeStore((state) => state.width);

  // Dex Buy Setting State ✨
  const checkBoxesPreview = useDexesFilterStore(
    (state) => state.filters.preview.checkBoxes,
  );
  const checkBoxesGenuine = useDexesFilterStore(
    (state) => state.filters.genuine.checkBoxes,
  );
  const { toggleDexesFilter, resetDexesFilters, applyDexesFilters } =
    useDexesFilterStore();
  const dexesCount = Object.values(checkBoxesGenuine).filter(Boolean).length;

  // Modal & Drawer State ✨
  const [openFilterPopover, setOpenFilterPopover] = useState<boolean>(false);
  const [openFilterDrawer, setOpenFilterDrawer] = useState<boolean>(false);
  const customSetOpenFilterPopover = (isOpen: boolean) => {
    setOpenFilterPopover(isOpen);
    if (
      JSON.stringify(checkBoxesPreview) !== JSON.stringify(checkBoxesGenuine)
    ) {
      handleApplyFilter();
    }
  };
  const customSetOpenFilterDrawer = (isOpen: boolean) => {
    setOpenFilterDrawer(isOpen);
    if (
      JSON.stringify(checkBoxesPreview) !== JSON.stringify(checkBoxesGenuine)
    ) {
      handleApplyFilter();
    }
  };

  useEffect(() => {
    if (width! >= 1280 && openFilterDrawer) {
      setOpenFilterDrawer(false);
    } else if (width! < 1280 && openFilterPopover) {
      setOpenFilterPopover(false);
    }
  }, [width]);

  const handleResetFilter = () => {
    setIsLoadingFilterFetch(true);

    resetDexesFilters("genuine");
    resetDexesFilters("preview");
    setOpenFilterPopover(false);
    setOpenFilterDrawer(false);
  };
  const handleApplyFilter = () => {
    setIsLoadingFilterFetch(true);

    setOpenFilterPopover(false);
    setOpenFilterDrawer(false);

    applyDexesFilters();
  };

  return (
    <>
      {/* Desktop */}
      <Popover
        open={openFilterPopover}
        onOpenChange={customSetOpenFilterPopover}
      >
        <PopoverTrigger asChild>
          <div id="trending-dexes-filter" className="hidden lg:flex">
            <FilterButton
              handleOpen={() => setOpenFilterPopover((prev) => !prev)}
              isActive={openFilterPopover}
              text="Dexes"
              className="hidden h-8 pl-2.5 pr-3 text-sm lg:flex"
              suffixEl={
                <div className="flex h-[17px] w-[16px] items-center justify-center rounded-[5px] bg-success px-1">
                  <span className="font-geistSemiBold text-xs text-[#080811]">
                    {dexesCount}
                  </span>
                </div>
              }
            />
          </div>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          sideOffset={8}
          className="gb__white__popover relative hidden h-auto w-[360px] flex-col border border-border bg-[#080811] p-0 shadow-[0_10px_20px_0_rgba(0,0,0,1)] lg:flex"
        >
          <div className="flex h-[52px] flex-row items-center justify-between border-b border-border p-4">
            <h4 className="font-geistSemiBold text-base text-fontColorPrimary">
              Dexes
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
          <div className="flex w-full flex-col gap-y-2 p-4">
            <button
              onClick={() => toggleDexesFilter("pumpfun", "preview")}
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
                    checkBoxesPreview?.pumpfun
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
              onClick={() => toggleDexesFilter("moonshot", "preview")}
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
                    checkBoxesPreview?.moonshot
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
                toggleDexesFilter("dynamic_bonding_curve", "preview")
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
                    checkBoxesPreview?.dynamic_bonding_curve
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
              onClick={() => toggleDexesFilter("bonk", "preview")}
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
                    checkBoxesPreview?.bonk
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
              onClick={() => toggleDexesFilter("launch_a_coin", "preview")}
              className="flex h-8 w-full cursor-pointer items-center justify-between gap-x-2 rounded-[8px] border border-border bg-white/[3%] py-1 pl-2 pr-1 duration-300 hover:bg-white/[6%]"
            >
              <div className="flex items-center gap-x-2">
                <div className="relative aspect-square h-5 w-5 flex-shrink-0">
                  <Image
                    src="/icons/asset/believe.png"
                    alt="Believe Icon"
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
                    checkBoxesPreview?.believe
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
            <button
              onClick={() => toggleDexesFilter("launchlab", "preview")}
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
                    checkBoxesPreview?.launchlab
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
              onClick={() => toggleDexesFilter("boop", "preview")}
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
                    checkBoxesPreview?.boop
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
            <button
              onClick={() => toggleDexesFilter("raydium", "preview")}
              className="flex h-8 w-full cursor-pointer items-center justify-between gap-x-2 rounded-[8px] border border-border bg-white/[3%] py-1 pl-2 pr-1 duration-300 hover:bg-white/[6%]"
            >
              <div className="flex items-center gap-x-2">
                <div className="relative aspect-square h-5 w-5 flex-shrink-0">
                  <Image
                    src="/icons/asset/raydium.png"
                    alt="Raydium Icon"
                    fill
                    quality={100}
                    className="object-contain"
                  />
                </div>
                <span className="inline-block text-nowrap text-sm text-fontColorPrimary">
                  Raydium
                </span>
              </div>
              <div className="relative aspect-square h-6 w-6 flex-shrink-0">
                <Image
                  src={
                    checkBoxesPreview?.raydium
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
              onClick={() => toggleDexesFilter("pumpswap", "preview")}
              className="flex h-8 w-full cursor-pointer items-center justify-between gap-x-2 rounded-[8px] border border-border bg-white/[3%] py-1 pl-2 pr-1 duration-300 hover:bg-white/[6%]"
            >
              <div className="flex items-center gap-x-2">
                <div className="relative aspect-square h-5 w-5 flex-shrink-0 hue-rotate-[120deg] saturate-150">
                  <Image
                    src="/icons/asset/pumpfun.png"
                    alt="Pump Swap Icon"
                    fill
                    quality={100}
                    className="object-contain"
                  />
                </div>
                <span className="inline-block text-nowrap text-sm text-fontColorPrimary">
                  Pump.Swap
                </span>
              </div>
              <div className="relative aspect-square h-6 w-6 flex-shrink-0">
                <Image
                  src={
                    checkBoxesPreview?.pumpswap
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
              onClick={() => toggleDexesFilter("meteora_amm", "preview")}
              className="flex h-8 w-full cursor-pointer items-center justify-between gap-x-2 rounded-[8px] border border-border bg-white/[3%] py-1 pl-2 pr-1 duration-300 hover:bg-white/[6%]"
            >
              <div className="flex items-center gap-x-2">
                <div className="relative aspect-square h-5 w-5 flex-shrink-0">
                  <Image
                    src="/icons/asset/meteora.png"
                    alt="Meteora AMM Icon"
                    fill
                    quality={100}
                    className="object-contain"
                  />
                </div>
                <span className="inline-block text-nowrap text-sm text-fontColorPrimary">
                  Meteora AMM
                </span>
              </div>
              <div className="relative aspect-square h-6 w-6 flex-shrink-0">
                <Image
                  src={
                    checkBoxesPreview?.meteora_amm
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
              onClick={() => toggleDexesFilter("meteora_amm_v2", "preview")}
              className="flex h-8 w-full cursor-pointer items-center justify-between gap-x-2 rounded-[8px] border border-border bg-white/[3%] py-1 pl-2 pr-1 duration-300 hover:bg-white/[6%]"
            >
              <div className="flex items-center gap-x-2">
                <div className="relative aspect-square h-5 w-5 flex-shrink-0 brightness-125 hue-rotate-[15deg] saturate-150">
                  <Image
                    src="/icons/asset/meteora.png"
                    alt="Meteora Icon"
                    fill
                    quality={100}
                    className="object-contain"
                  />
                </div>
                <span className="inline-block text-nowrap text-sm text-fontColorPrimary">
                  Meteora AMM V2
                </span>
              </div>
              <div className="relative aspect-square h-6 w-6 flex-shrink-0">
                <Image
                  src={
                    checkBoxesPreview?.meteora_amm_v2
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

          {/* CTA */}
          <div className="flex h-[64px] w-full items-center justify-between gap-x-3 rounded-b-[8px] border-t border-border bg-[#080811] p-4">
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
      <Drawer open={openFilterDrawer} onOpenChange={customSetOpenFilterDrawer}>
        <DrawerTrigger asChild>
          <div id="trending-dexes-filter-mobile" className="flex lg:hidden">
            <FilterButton
              handleOpen={() => setOpenFilterDrawer((prev) => !prev)}
              isActive={openFilterDrawer}
              text="Dexes"
              className="flex h-8 pl-2.5 pr-3 text-sm lg:hidden"
              suffixEl={
                <div className="flex h-[17px] w-[16px] items-center justify-center rounded-[5px] bg-success px-1">
                  <span className="font-geistSemiBold text-xs text-[#080811]">
                    {dexesCount}
                  </span>
                </div>
              }
            />
          </div>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader className="flex h-[62px] flex-row items-center justify-between border-b border-border p-4">
            <DrawerTitle>Filter</DrawerTitle>
            <button
              title="Close"
              onClick={() => setOpenFilterDrawer((prev) => !prev)}
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
          <div className="flex w-full flex-col gap-y-2 p-4">
            <button
              onClick={() => toggleDexesFilter("pumpfun", "preview")}
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
                    checkBoxesPreview?.pumpfun
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
              onClick={() => toggleDexesFilter("moonshot", "preview")}
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
                    checkBoxesPreview?.moonshot
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
                toggleDexesFilter("dynamic_bonding_curve", "preview")
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
                    checkBoxesPreview?.dynamic_bonding_curve
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
              onClick={() => toggleDexesFilter("bonk", "preview")}
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
                    checkBoxesPreview?.bonk
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
              onClick={() => toggleDexesFilter("launch_a_coin", "preview")}
              className="flex h-8 w-full cursor-pointer items-center justify-between gap-x-2 rounded-[8px] border border-border bg-white/[3%] py-1 pl-2 pr-1 duration-300 hover:bg-white/[6%]"
            >
              <div className="flex items-center gap-x-2">
                <div className="relative aspect-square h-5 w-5 flex-shrink-0">
                  <Image
                    src="/icons/asset/believe.png"
                    alt="Believe Icon"
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
                    checkBoxesPreview?.believe
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
            <button
              onClick={() => toggleDexesFilter("launchlab", "preview")}
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
                    checkBoxesPreview?.launchlab
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
              onClick={() => toggleDexesFilter("boop", "preview")}
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
                    checkBoxesPreview?.boop
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
            <button
              onClick={() => toggleDexesFilter("raydium", "preview")}
              className="flex h-8 w-full cursor-pointer items-center justify-between gap-x-2 rounded-[8px] border border-border bg-white/[3%] py-1 pl-2 pr-1 duration-300 hover:bg-white/[6%]"
            >
              <div className="flex items-center gap-x-2">
                <div className="relative aspect-square h-5 w-5 flex-shrink-0">
                  <Image
                    src="/icons/asset/raydium.png"
                    alt="Raydium Icon"
                    fill
                    quality={100}
                    className="object-contain"
                  />
                </div>
                <span className="inline-block text-nowrap text-sm text-fontColorPrimary">
                  Raydium
                </span>
              </div>
              <div className="relative aspect-square h-6 w-6 flex-shrink-0">
                <Image
                  src={
                    checkBoxesPreview?.raydium
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
              onClick={() => toggleDexesFilter("pumpswap", "preview")}
              className="flex h-8 w-full cursor-pointer items-center justify-between gap-x-2 rounded-[8px] border border-border bg-white/[3%] py-1 pl-2 pr-1 duration-300 hover:bg-white/[6%]"
            >
              <div className="flex items-center gap-x-2">
                <div className="relative aspect-square h-5 w-5 flex-shrink-0 hue-rotate-[120deg] saturate-150">
                  <Image
                    src="/icons/asset/pumpfun.png"
                    alt="Pump Swap Icon"
                    fill
                    quality={100}
                    className="object-contain"
                  />
                </div>
                <span className="inline-block text-nowrap text-sm text-fontColorPrimary">
                  Pump.Swap
                </span>
              </div>
              <div className="relative aspect-square h-6 w-6 flex-shrink-0">
                <Image
                  src={
                    checkBoxesPreview?.pumpswap
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
              onClick={() => toggleDexesFilter("meteora_amm", "preview")}
              className="flex h-8 w-full cursor-pointer items-center justify-between gap-x-2 rounded-[8px] border border-border bg-white/[3%] py-1 pl-2 pr-1 duration-300 hover:bg-white/[6%]"
            >
              <div className="flex items-center gap-x-2">
                <div className="relative aspect-square h-5 w-5 flex-shrink-0">
                  <Image
                    src="/icons/asset/meteora.png"
                    alt="Meteora AMM Icon"
                    fill
                    quality={100}
                    className="object-contain"
                  />
                </div>
                <span className="inline-block text-nowrap text-sm text-fontColorPrimary">
                  Meteora AMM
                </span>
              </div>
              <div className="relative aspect-square h-6 w-6 flex-shrink-0">
                <Image
                  src={
                    checkBoxesPreview?.meteora_amm
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
              onClick={() => toggleDexesFilter("meteora_amm_v2", "preview")}
              className="flex h-8 w-full cursor-pointer items-center justify-between gap-x-2 rounded-[8px] border border-border bg-white/[3%] py-1 pl-2 pr-1 duration-300 hover:bg-white/[6%]"
            >
              <div className="flex items-center gap-x-2">
                <div className="relative aspect-square h-5 w-5 flex-shrink-0 brightness-125 hue-rotate-[15deg] saturate-150">
                  <Image
                    src="/icons/asset/meteora.png"
                    alt="Meteora AMM V2 Icon"
                    fill
                    quality={100}
                    className="object-contain"
                  />
                </div>
                <span className="inline-block text-nowrap text-sm text-fontColorPrimary">
                  Meteora AMM V2
                </span>
              </div>
              <div className="relative aspect-square h-6 w-6 flex-shrink-0">
                <Image
                  src={
                    checkBoxesPreview?.meteora_amm_v2
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

          {/* CTA */}
          <div className="flex h-[64px] w-full items-center justify-between gap-x-3 border-t border-border bg-[#080811] p-4">
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
}
