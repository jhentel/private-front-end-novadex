"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import React, { useState, useEffect } from "react";
import {
  useMoreFilterStore,
  MoreFilterState,
} from "@/stores/dex-setting/use-more-filter.store";
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
  DrawerTrigger,
} from "@/components/ui/drawer";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import { useWindowSizeStore } from "@/stores/use-window-size.store";

const TrendingFilterPopover = React.memo(() => {
  // Filter & Hovered Configuration ✨
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
  } = useMoreFilterStore((state) => state.filters.preview);
  const {
    showKeywords: GshowKeywords,
    checkBoxes: GcheckBoxes,
    byCurrentLiquidity: GbyCurrentLiquidity,
    byVolume: GbyVolume,
    byAge: GbyAge,
    byMarketCap: GbyMarketCap,
    byTXNS: GbyTXNS,
    byBuys: GbyBuys,
    bySells: GbySells,
  } = useMoreFilterStore((state) => state.filters.genuine);
  const {
    setIsLoadingFilterFetch,
    toggleCheckbox,
    setShowKeywords,
    setRangeFilter,
    resetMoreFilters,
    applyMoreFilters,
  } = useMoreFilterStore();

  const [openFilterPopover, setOpenFilterPopover] = useState<boolean>(false);
  const [openFilterDrawer, setOpenFilterDrawer] = useState<boolean>(false);
  const customSetOpenFilterPopover = (isOpen: boolean) => {
    setOpenFilterPopover(isOpen);
    if (
      JSON.stringify({
        showKeywords,
        checkBoxes,
        byCurrentLiquidity,
        byVolume,
        byAge,
        byMarketCap,
        byTXNS,
        byBuys,
        bySells,
      }) !==
      JSON.stringify({
        GshowKeywords,
        GcheckBoxes,
        GbyCurrentLiquidity,
        GbyVolume,
        GbyAge,
        GbyMarketCap,
        GbyTXNS,
        GbyBuys,
        GbySells,
      })
    ) {
      handleApplyFilter();
    }
  };
  const customSetOpenFilterDrawer = (isOpen: boolean) => {
    setOpenFilterDrawer(isOpen);
    if (
      JSON.stringify({
        showKeywords,
        checkBoxes,
        byCurrentLiquidity,
        byVolume,
        byAge,
        byMarketCap,
        byTXNS,
        byBuys,
        bySells,
      }) !==
      JSON.stringify({
        GshowKeywords,
        GcheckBoxes,
        GbyCurrentLiquidity,
        GbyVolume,
        GbyAge,
        GbyMarketCap,
        GbyTXNS,
        GbyBuys,
        GbySells,
      })
    ) {
      handleApplyFilter();
    }
  };

    const width = useWindowSizeStore((state) => state.width);

  useEffect(() => {
    if (width! >= 1024 && openFilterDrawer) {
      setOpenFilterDrawer(false);
    } else if (width! < 1024 && openFilterPopover) {
      setOpenFilterPopover(false);
    }
  }, [width]);

  const isRangeFilterActive = (filter: {
    min?: number;
    max?: number;
  }): boolean => {
    return filter.min !== undefined || filter.max !== undefined;
  };
  const filterCount =
    Object.values(GcheckBoxes).filter(Boolean).length +
    [
      GshowKeywords.trim() !== "",
      ...Object.values({
        GbyCurrentLiquidity,
        GbyVolume,
        GbyAge,
        GbyMarketCap,
        GbyTXNS,
        GbyBuys,
        GbySells,
      }).map(isRangeFilterActive),
    ].filter(Boolean).length;

  const handleNormalValue = (
    filterKey: keyof Omit<
      MoreFilterState["filters"]["preview"],
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
      MoreFilterState["filters"]["preview"],
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

    resetMoreFilters("genuine");
    resetMoreFilters("preview");
    setOpenFilterPopover(false);
    setOpenFilterDrawer(false);
  };
  const handleApplyFilter = () => {
    setIsLoadingFilterFetch(true);

    setOpenFilterPopover(false);
    setOpenFilterDrawer(false);

    applyMoreFilters();
  };

  return (
    <>
      {/* Desktop */}
      <Popover
        open={openFilterPopover}
        onOpenChange={customSetOpenFilterPopover}
      >
        <PopoverTrigger asChild>
          <div className="hidden lg:flex">
            <FilterButton
              handleOpen={() => setOpenFilterPopover((prev) => !prev)}
              isActive={openFilterPopover}
              text="Filters"
              className="hidden h-8 pl-2.5 pr-3 text-sm lg:flex"
              suffixEl={
                <div className="flex h-[17px] w-[16px] items-center justify-center rounded-[5px] bg-success px-1">
                  <span className="font-geistSemiBold text-xs text-[#080811]">
                    {filterCount}
                  </span>
                </div>
              }
            />
          </div>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          sideOffset={8}
          className="gb__white__popover relative hidden h-[65vh] max-h-[1380px] min-h-[320px] w-[360px] flex-col border border-border bg-[#080811] p-0 shadow-[0_10px_20px_0_rgba(0,0,0,1)] lg:flex"
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
          <OverlayScrollbarsComponent
            defer
            element="div"
            className="invisible__overlayscrollbar relative w-full flex-grow overflow-y-scroll"
          >
            <div className="absolute left-0 top-0 w-full flex-grow pb-[70px]">
              <div className="flex h-auto w-full flex-col">
                {/* A. Symbol / Name */}
                <div className="flex w-full justify-between gap-x-2 p-4">
                  <div className="flex w-full flex-col gap-y-1">
                    <Label
                      htmlFor="showsymbolorname"
                      className="w-[80%] justify-between text-nowrap text-sm text-fontColorSecondary"
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
                      placeholder="Max 3 Keywords"
                      className="block h-8 w-full text-nowrap border-border bg-transparent text-sm text-fontColorPrimary placeholder:text-fontColorSecondary focus:outline-none focus:ring-0"
                    />
                  </div>
                </div>

                <Separator />

                {/* B. Audit Results */}
                <div className="flex w-full flex-col gap-y-2 p-4">
                  <div
                    onClick={() => toggleCheckbox("mintAuth", "preview")}
                    className="flex h-8 w-full cursor-pointer items-center justify-between gap-x-2 rounded-[8px] border border-border py-1 pl-2 pr-1"
                  >
                    <span className="inline-block text-nowrap font-geistLight text-sm text-fontColorPrimary">
                      Mint Auth
                    </span>
                    <div className="relative aspect-square h-6 w-6 flex-shrink-0">
                      <Image
                        src={
                          checkBoxes.mintAuth
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
                  <div
                    onClick={() => toggleCheckbox("freezeAuth", "preview")}
                    className="flex h-8 w-full cursor-pointer items-center justify-between gap-x-2 rounded-[8px] border border-border py-1 pl-2 pr-1"
                  >
                    <span className="inline-block text-nowrap font-geistLight text-sm text-fontColorPrimary">
                      Freeze Auth
                    </span>
                    <div className="relative aspect-square h-6 w-6 flex-shrink-0">
                      <Image
                        src={
                          checkBoxes.freezeAuth
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
                  <div
                    onClick={() => toggleCheckbox("onlyLPBurned", "preview")}
                    className="flex h-8 w-full cursor-pointer items-center justify-between gap-x-2 rounded-[8px] border border-border py-1 pl-2 pr-1"
                  >
                    <span className="inline-block text-nowrap font-geistLight text-sm text-fontColorPrimary">
                      Only LP Burned
                    </span>
                    <div className="relative aspect-square h-6 w-6 flex-shrink-0">
                      <Image
                        src={
                          checkBoxes.onlyLPBurned
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
                  <div
                    onClick={() => toggleCheckbox("top10Holders", "preview")}
                    className="flex h-8 w-full cursor-pointer items-center justify-between gap-x-2 rounded-[8px] border border-border py-1 pl-2 pr-1"
                  >
                    <span className="inline-block text-nowrap font-geistLight text-sm text-fontColorPrimary">
                      Top 10 Holders
                    </span>
                    <div className="relative aspect-square h-6 w-6 flex-shrink-0">
                      <Image
                        src={
                          checkBoxes.top10Holders
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
                  <div
                    onClick={() => toggleCheckbox("hideBundled", "preview")}
                    className="flex h-8 w-full cursor-pointer items-center justify-between gap-x-2 rounded-[8px] border border-border py-1 pl-2 pr-1"
                  >
                    <span className="inline-block text-nowrap font-geistLight text-sm text-fontColorPrimary">
                      Hide Bundled
                    </span>
                    <div className="relative aspect-square h-6 w-6 flex-shrink-0">
                      <Image
                        src={
                          checkBoxes.hideBundled
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
                  <div
                    onClick={() =>
                      toggleCheckbox("withAtLeast1Social", "preview")
                    }
                    className="flex h-8 w-full cursor-pointer items-center justify-between gap-x-2 rounded-[8px] border border-border py-1 pl-2 pr-1"
                  >
                    <span className="inline-block text-nowrap font-geistLight text-sm text-fontColorPrimary">
                      With at least 1 social
                    </span>
                    <div className="relative aspect-square h-6 w-6 flex-shrink-0">
                      <Image
                        src={
                          checkBoxes.withAtLeast1Social
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

                <Separator />

                {/* C. By Range */}
                <div className="flex w-full flex-col gap-y-4 p-4">
                  {/* By Current Liquidity($) */}
                  <div className="flex items-center gap-x-2">
                    <Label className="w-[80%] justify-between text-nowrap text-sm text-fontColorSecondary">
                      By Current Liquidity($)
                    </Label>
                    <div className="flex w-full items-center gap-x-2">
                      <Input
                        type="number"
                        value={byCurrentLiquidity.min}
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
                        value={byCurrentLiquidity.max}
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
                        value={byVolume.min}
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
                        value={byVolume.max}
                        onChange={(e) =>
                          handleNormalValue("byVolume", e, "max")
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
                        value={byAge.min}
                        onChange={(e) => handleNormalValue("byAge", e, "min")}
                        placeholder="Min"
                        className="block h-8 w-full text-nowrap border-border bg-transparent text-sm text-fontColorPrimary placeholder:text-fontColorSecondary focus:outline-none focus:ring-0"
                      />
                      {/* <div className="flex-shrink-0 text-sm text-fontColorSecondary">
                        to
                      </div> */}
                      <Input
                        type="number"
                        value={byAge.max}
                        onChange={(e) => handleNormalValue("byAge", e, "max")}
                        placeholder="Max"
                        className="block h-8 w-full text-nowrap border-border bg-transparent text-sm text-fontColorPrimary placeholder:text-fontColorSecondary focus:outline-none focus:ring-0"
                      />
                    </div>
                  </div>

                  {/* By Market Cap */}
                  <div className="flex items-center gap-x-2">
                    <Label className="w-[80%] justify-between text-nowrap text-sm text-fontColorSecondary">
                      By Market Cap
                    </Label>
                    <div className="flex w-full items-center gap-x-2">
                      <Input
                        type="number"
                        value={byMarketCap.min}
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
                        value={byMarketCap.max}
                        onChange={(e) =>
                          handleNormalValue("byMarketCap", e, "max")
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
                        value={byTXNS.min}
                        onChange={(e) => handleNormalValue("byTXNS", e, "min")}
                        placeholder="Min"
                        className="block h-8 w-full text-nowrap border-border bg-transparent text-sm text-fontColorPrimary placeholder:text-fontColorSecondary focus:outline-none focus:ring-0"
                      />
                      {/* <div className="flex-shrink-0 text-sm text-fontColorSecondary">
                        to
                      </div> */}
                      <Input
                        type="number"
                        value={byTXNS.max}
                        onChange={(e) => handleNormalValue("byTXNS", e, "max")}
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
                        value={byBuys.min}
                        onChange={(e) => handleNormalValue("byBuys", e, "min")}
                        placeholder="Min"
                        className="block h-8 w-full text-nowrap border-border bg-transparent text-sm text-fontColorPrimary placeholder:text-fontColorSecondary focus:outline-none focus:ring-0"
                      />
                      {/* <div className="flex-shrink-0 text-sm text-fontColorSecondary">
                        to
                      </div> */}
                      <Input
                        type="number"
                        value={byBuys.max}
                        onChange={(e) => handleNormalValue("byBuys", e, "max")}
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
                        value={bySells.min}
                        onChange={(e) => handleNormalValue("bySells", e, "min")}
                        placeholder="Min"
                        className="block h-8 w-full text-nowrap border-border bg-transparent text-sm text-fontColorPrimary placeholder:text-fontColorSecondary focus:outline-none focus:ring-0"
                      />
                      {/* <div className="flex-shrink-0 text-sm text-fontColorSecondary">
                        to
                      </div> */}
                      <Input
                        type="number"
                        value={bySells.max}
                        onChange={(e) => handleNormalValue("bySells", e, "max")}
                        placeholder="Max"
                        className="block h-8 w-full text-nowrap border-border bg-transparent text-sm text-fontColorPrimary placeholder:text-fontColorSecondary focus:outline-none focus:ring-0"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </OverlayScrollbarsComponent>

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
      <Drawer open={openFilterDrawer} onOpenChange={customSetOpenFilterDrawer}>
        <DrawerTrigger asChild>
          <div className="flex lg:hidden">
            <FilterButton
              handleOpen={() => setOpenFilterDrawer((prev) => !prev)}
              isActive={openFilterDrawer}
              text="Filters"
              className="flex h-8 pl-2.5 pr-3 text-sm lg:hidden"
              suffixEl={
                <div className="flex h-[17px] w-[16px] items-center justify-center rounded-[5px] bg-success px-1">
                  <span className="font-geistSemiBold text-xs text-[#080811]">
                    {filterCount}
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
          <OverlayScrollbarsComponent
            defer
            element="div"
            className="invisible__overlayscrollbar relative h-[87vh] w-full flex-grow overflow-y-scroll"
          >
            <div className="flex h-auto w-full flex-col pb-[70px]">
              {/* A. Symbol / Name */}
              <div className="flex w-full justify-between gap-x-2 p-4">
                <div className="flex w-full flex-col gap-y-1">
                  <Label
                    htmlFor="showsymbolorname"
                    className="w-[80%] justify-between text-nowrap text-sm text-fontColorSecondary"
                  >
                    Symbol/Name
                  </Label>
                  <Input
                    id="showsymbolorname"
                    type="text"
                    value={showKeywords}
                    onChange={(e) => setShowKeywords(e.target.value, "preview")}
                    placeholder="Max 3 Keywords"
                    className="block h-8 w-full text-nowrap border-border bg-transparent text-sm text-fontColorPrimary placeholder:text-fontColorSecondary focus:outline-none focus:ring-0"
                  />
                </div>
              </div>

              <Separator />

              {/* B. Audit Results */}
              <div className="flex w-full flex-col gap-y-2 p-4">
                <div
                  onClick={() => toggleCheckbox("mintAuth", "preview")}
                  className="flex h-8 w-full cursor-pointer items-center justify-between gap-x-2 rounded-[8px] border border-border py-1 pl-2 pr-1"
                >
                  <span className="inline-block text-nowrap font-geistLight text-sm text-fontColorPrimary">
                    Mint Auth
                  </span>
                  <div className="relative aspect-square h-6 w-6 flex-shrink-0">
                    <Image
                      src={
                        checkBoxes.mintAuth
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
                <div
                  onClick={() => toggleCheckbox("freezeAuth", "preview")}
                  className="flex h-8 w-full cursor-pointer items-center justify-between gap-x-2 rounded-[8px] border border-border py-1 pl-2 pr-1"
                >
                  <span className="inline-block text-nowrap font-geistLight text-sm text-fontColorPrimary">
                    Freeze Auth
                  </span>
                  <div className="relative aspect-square h-6 w-6 flex-shrink-0">
                    <Image
                      src={
                        checkBoxes.freezeAuth
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
                <div
                  onClick={() => toggleCheckbox("onlyLPBurned", "preview")}
                  className="flex h-8 w-full cursor-pointer items-center justify-between gap-x-2 rounded-[8px] border border-border py-1 pl-2 pr-1"
                >
                  <span className="inline-block text-nowrap font-geistLight text-sm text-fontColorPrimary">
                    Only LP Burned
                  </span>
                  <div className="relative aspect-square h-6 w-6 flex-shrink-0">
                    <Image
                      src={
                        checkBoxes.onlyLPBurned
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
                <div
                  onClick={() => toggleCheckbox("top10Holders", "preview")}
                  className="flex h-8 w-full cursor-pointer items-center justify-between gap-x-2 rounded-[8px] border border-border py-1 pl-2 pr-1"
                >
                  <span className="inline-block text-nowrap font-geistLight text-sm text-fontColorPrimary">
                    Top 10 Holders
                  </span>
                  <div className="relative aspect-square h-6 w-6 flex-shrink-0">
                    <Image
                      src={
                        checkBoxes.top10Holders
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
                <div
                  onClick={() => toggleCheckbox("hideBundled", "preview")}
                  className="flex h-8 w-full cursor-pointer items-center justify-between gap-x-2 rounded-[8px] border border-border py-1 pl-2 pr-1"
                >
                  <span className="inline-block text-nowrap font-geistLight text-sm text-fontColorPrimary">
                    Hide Bundled
                  </span>
                  <div className="relative aspect-square h-6 w-6 flex-shrink-0">
                    <Image
                      src={
                        checkBoxes.hideBundled
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
                <div
                  onClick={() =>
                    toggleCheckbox("withAtLeast1Social", "preview")
                  }
                  className="flex h-8 w-full cursor-pointer items-center justify-between gap-x-2 rounded-[8px] border border-border py-1 pl-2 pr-1"
                >
                  <span className="inline-block text-nowrap font-geistLight text-sm text-fontColorPrimary">
                    With at least 1 social
                  </span>
                  <div className="relative aspect-square h-6 w-6 flex-shrink-0">
                    <Image
                      src={
                        checkBoxes.withAtLeast1Social
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

              <Separator />

              {/* C. By Range */}
              <div className="flex w-full flex-col gap-y-4 p-4">
                {/* By Current Liquidity($) */}
                <div className="flex items-center gap-x-2">
                  <Label className="w-[80%] justify-between text-nowrap text-sm text-fontColorSecondary">
                    By Current Liquidity($)
                  </Label>
                  <div className="flex w-full items-center gap-x-2">
                    <Input
                      type="number"
                      value={byCurrentLiquidity.min}
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
                      value={byCurrentLiquidity.max}
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
                      value={byVolume.min}
                      onChange={(e) => handleNormalValue("byVolume", e, "min")}
                      placeholder="Min"
                      className="block h-8 w-full text-nowrap border-border bg-transparent text-sm text-fontColorPrimary placeholder:text-fontColorSecondary focus:outline-none focus:ring-0"
                    />
                    {/* <div className="flex-shrink-0 text-sm text-fontColorSecondary">
                      to
                    </div> */}
                    <Input
                      type="number"
                      value={byVolume.max}
                      onChange={(e) => handleNormalValue("byVolume", e, "max")}
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
                      value={byAge.min}
                      onChange={(e) => handleNormalValue("byAge", e, "min")}
                      placeholder="Min"
                      className="block h-8 w-full text-nowrap border-border bg-transparent text-sm text-fontColorPrimary placeholder:text-fontColorSecondary focus:outline-none focus:ring-0"
                    />
                    {/* <div className="flex-shrink-0 text-sm text-fontColorSecondary">
                      to
                    </div> */}
                    <Input
                      type="number"
                      value={byAge.max}
                      onChange={(e) => handleNormalValue("byAge", e, "max")}
                      placeholder="Max"
                      className="block h-8 w-full text-nowrap border-border bg-transparent text-sm text-fontColorPrimary placeholder:text-fontColorSecondary focus:outline-none focus:ring-0"
                    />
                  </div>
                </div>

                {/* By Market Cap */}
                <div className="flex items-center gap-x-2">
                  <Label className="w-[80%] justify-between text-nowrap text-sm text-fontColorSecondary">
                    By Market Cap
                  </Label>
                  <div className="flex w-full items-center gap-x-2">
                    <Input
                      type="number"
                      value={byMarketCap.min}
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
                      value={byMarketCap.max}
                      onChange={(e) =>
                        handleNormalValue("byMarketCap", e, "max")
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
                      value={byTXNS.min}
                      onChange={(e) => handleNormalValue("byTXNS", e, "min")}
                      placeholder="Min"
                      className="block h-8 w-full text-nowrap border-border bg-transparent text-sm text-fontColorPrimary placeholder:text-fontColorSecondary focus:outline-none focus:ring-0"
                    />
                    {/* <div className="flex-shrink-0 text-sm text-fontColorSecondary">
                      to
                    </div> */}
                    <Input
                      type="number"
                      value={byTXNS.max}
                      onChange={(e) => handleNormalValue("byTXNS", e, "max")}
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
                      value={byBuys.min}
                      onChange={(e) => handleNormalValue("byBuys", e, "min")}
                      placeholder="Min"
                      className="block h-8 w-full text-nowrap border-border bg-transparent text-sm text-fontColorPrimary placeholder:text-fontColorSecondary focus:outline-none focus:ring-0"
                    />
                    {/* <div className="flex-shrink-0 text-sm text-fontColorSecondary">
                      to
                    </div> */}
                    <Input
                      type="number"
                      value={byBuys.max}
                      onChange={(e) => handleNormalValue("byBuys", e, "max")}
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
                      value={bySells.min}
                      onChange={(e) => handleNormalValue("bySells", e, "min")}
                      placeholder="Min"
                      className="block h-8 w-full text-nowrap border-border bg-transparent text-sm text-fontColorPrimary placeholder:text-fontColorSecondary focus:outline-none focus:ring-0"
                    />
                    {/* <div className="flex-shrink-0 text-sm text-fontColorSecondary">
                      to
                    </div> */}
                    <Input
                      type="number"
                      value={bySells.max}
                      onChange={(e) => handleNormalValue("bySells", e, "max")}
                      placeholder="Max"
                      className="block h-8 w-full text-nowrap border-border bg-transparent text-sm text-fontColorPrimary placeholder:text-fontColorSecondary focus:outline-none focus:ring-0"
                    />
                  </div>
                </div>
              </div>
            </div>
          </OverlayScrollbarsComponent>

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
});

TrendingFilterPopover.displayName = "TrendingFilterPopover";

export default TrendingFilterPopover;
