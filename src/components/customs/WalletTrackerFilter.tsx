"use client";

import React, { useEffect, useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../ui/drawer";
import FilterButton, { FilterButtonProps } from "./buttons/FilterButton";
import Image from "next/image";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import BaseButton from "./buttons/BaseButton";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { RefreshCw } from "lucide-react";
import { useWalletTrackerFilterStore } from "@/stores/dex-setting/use-wallet-tracker-filter.store";
import { CachedImage } from "./CachedImage";

interface WalletTrackerFilterProps {
  isMobile?: boolean;
  filterButtonProps?: Partial<FilterButtonProps>;
}

const WalletTrackerFilter = ({
  isMobile = false,
  filterButtonProps,
}: WalletTrackerFilterProps) => {
  const {
    minSol,
    excludeSells,
    excludeBuys,
    activeFilterCount: activeWalletTrackerFilterCount,
    setMinSol,
    setExcludeSells,
    setExcludeBuys,
    resetFilters,
  } = useWalletTrackerFilterStore();

  // Local state for Wallet Tracker Filter
  const [localMinSol, setLocalMinSol] = useState(minSol);
  const [localExcludeSells, setLocalExcludeSells] = useState(excludeSells);
  const [localExcludeBuys, setLocalExcludeBuys] = useState(excludeBuys);
  const [inputKey, setInputKey] = useState(0);

  const [openWalletTrackerFilterPopover, setOpenWalletTrackerFilterPopover] =
    useState<boolean>(false);
  const [openWalletTrackerFilterDrawer, setOpenWalletTrackerFilterDrawer] =
    useState<boolean>(false);

  const customSetOpenWalletTrackeFilterPopover = (isOpen: boolean) => {
    setOpenWalletTrackerFilterPopover(isOpen);
  };

  const customSetOpenWalletTrackeFilterDrawer = (isOpen: boolean) => {
    setOpenWalletTrackerFilterDrawer(isOpen);
  };

  const handleApplyWalletTrackerFilter = ({
    localExcludeBuys,
    localExcludeSells,
    localMinSol,
  }: {
    localMinSol: number;
    localExcludeSells: boolean;
    localExcludeBuys: boolean;
  }) => {
    setMinSol(localMinSol);
    setExcludeSells(localExcludeSells);
    setExcludeBuys(localExcludeBuys);

    // console.log("Filters applied: ", {
    //   minSol: localMinSol,
    //   excludeSells: localExcludeSells,
    //   excludeBuys: localExcludeBuys,
    // });
  };

  const handleResetWalletTrackerFilter = () => {
    resetFilters();
    setLocalMinSol(0);
    setLocalExcludeSells(false);
    setLocalExcludeBuys(false);
    setInputKey((prev) => prev + 1); // Reset the input key to force re-render
  };

  useEffect(() => {
    setLocalMinSol(minSol);
    setLocalExcludeSells(excludeSells);
    setLocalExcludeBuys(excludeBuys);
  }, [minSol, excludeSells, excludeBuys]);

  if (isMobile)
    return (
      <Drawer
        open={openWalletTrackerFilterDrawer}
        onOpenChange={customSetOpenWalletTrackeFilterDrawer}
      >
        <DrawerTrigger asChild>
          <div id="holdings-filter-button" className="flex lg:hidden">
            <FilterButton
              handleOpen={() =>
                setOpenWalletTrackerFilterDrawer((prev) => !prev)
              }
              isActive={openWalletTrackerFilterDrawer}
              text=""
              suffixEl={
                <div className="flex h-[17px] w-[16px] items-center justify-center rounded-[5px] bg-success px-1">
                  <span className="font-geistSemiBold text-xs text-[#080811]">
                    {activeWalletTrackerFilterCount}
                  </span>
                </div>
              }
              className="flex h-8 pl-2.5 pr-2 text-sm lg:hidden"
            />
          </div>
        </DrawerTrigger>
        <DrawerContent className="min-h-[85dvh]">
          <DrawerHeader className="flex h-[56px] flex-row items-center justify-between border-b border-border p-4">
            <DrawerTitle className="text-lg">Filter</DrawerTitle>
            <button
              title="Close"
              onClick={() => setOpenWalletTrackerFilterDrawer((prev) => !prev)}
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
            <div className="flex w-full items-center justify-between">
              <Label className="min-w-20 text-white">Min SOL:</Label>
              <Input
                key={inputKey} // Reset the input key to force re-render
                value={localMinSol}
                onNumericValueChange={(values) => {
                  const newValue =
                    values.floatValue === undefined ? 0 : values.floatValue;
                  setLocalMinSol(newValue);
                }}
                type="number"
                isNumeric
                decimalScale={9}
                placeholder="0"
                suffixEl={
                  <div className="absolute right-3.5 aspect-square h-4 w-4 flex-shrink-0">
                    <CachedImage
                      src="/icons/solana-sq.svg"
                      alt="Solana SQ Icon"
                      fill
                      quality={100}
                      className="object-contain"
                    />
                  </div>
                }
              />
            </div>

            <div className="flex flex-col gap-y-2">
              <div
                className="flex w-fit items-center gap-x-2"
                onClick={() => setLocalExcludeSells(!localExcludeSells)}
              >
                <div className="relative aspect-square h-6 w-6 flex-shrink-0">
                  <Image
                    src={
                      localExcludeSells
                        ? "/icons/footer/checked.png"
                        : "/icons/footer/unchecked.png"
                    }
                    alt="Check / Unchecked Icon"
                    fill
                    quality={100}
                    className="object-contain"
                  />
                </div>
                <span className="inline-block text-nowrap font-geistLight text-sm text-fontColorPrimary">
                  Exclude Sells
                </span>
              </div>

              <div
                className="flex w-fit items-center gap-x-2"
                onClick={() => setLocalExcludeBuys(!localExcludeBuys)}
              >
                <div className="relative aspect-square h-6 w-6 flex-shrink-0">
                  <Image
                    src={
                      localExcludeBuys
                        ? "/icons/footer/checked.png"
                        : "/icons/footer/unchecked.png"
                    }
                    alt="Check / Unchecked Icon"
                    fill
                    quality={100}
                    className="object-contain"
                  />
                </div>
                <span className="inline-block text-nowrap font-geistLight text-sm text-fontColorPrimary">
                  Exclude Buys
                </span>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="flex h-[64px] w-full items-center justify-between gap-x-3 border-t border-border p-4">
            <button
              onClick={() => handleResetWalletTrackerFilter()}
              className="font-geistSemiBold text-sm text-primary duration-300 hover:text-[#be7ad2]"
            >
              Reset
            </button>

            <BaseButton
              onClick={() => {
                handleApplyWalletTrackerFilter({
                  localMinSol,
                  localExcludeSells,
                  localExcludeBuys,
                });
              }}
              variant="primary"
              className="h-8 px-10"
            >
              <span className="font-geistSemiBold text-sm">Apply Filter</span>
            </BaseButton>
          </div>
        </DrawerContent>
      </Drawer>
    );
  return (
    <Popover
      open={openWalletTrackerFilterPopover}
      onOpenChange={customSetOpenWalletTrackeFilterPopover}
    >
      <PopoverTrigger asChild>
        <div id="holdings-filter-button" className="hidden lg:flex">
          <FilterButton
            handleOpen={() =>
              setOpenWalletTrackerFilterPopover((prev) => !prev)
            }
            isActive={openWalletTrackerFilterPopover}
            text="Filters"
            className="hidden h-8 pl-2.5 pr-2 text-sm lg:flex"
            {...filterButtonProps}
          />
        </div>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="gb__white__popover relative z-[999] hidden h-auto w-[320px] flex-col border border-border bg-card p-0 shadow-[0_10px_20px_0_rgba(0,0,0,1)] lg:flex"
      >
        <div className="flex w-full flex-col gap-y-2 p-4">
          {/* Fields */}
          <div className="flex w-full items-center justify-between">
            <Label className="min-w-20">Min SOL:</Label>
            <Input
              key={inputKey} // Reset the input key to force re-render
              value={localMinSol}
              onNumericValueChange={(values) => {
                const newValue =
                  values.floatValue === undefined ? 0 : values.floatValue;
                setLocalMinSol(newValue);
              }}
              type="number"
              isNumeric
              decimalScale={9}
              placeholder="0"
              suffixEl={
                <div className="absolute right-3.5 aspect-square h-4 w-4 flex-shrink-0">
                  <CachedImage
                    src="/icons/solana-sq.svg"
                    alt="Solana SQ Icon"
                    fill
                    quality={100}
                    className="object-contain"
                  />
                </div>
              }
            />
          </div>

          <div className="flex flex-col gap-y-2">
            <div
              className="flex w-fit items-center gap-x-2"
              onClick={() => setLocalExcludeSells(!localExcludeSells)}
            >
              <div className="relative aspect-square h-6 w-6 flex-shrink-0">
                <Image
                  src={
                    localExcludeSells
                      ? "/icons/footer/checked.png"
                      : "/icons/footer/unchecked.png"
                  }
                  alt="Check / Unchecked Icon"
                  fill
                  quality={100}
                  className="object-contain"
                />
              </div>
              <span className="inline-block text-nowrap font-geistLight text-sm text-fontColorPrimary">
                Exclude Sells
              </span>
            </div>

            <div
              className="flex w-fit items-center gap-x-2"
              onClick={() => setLocalExcludeBuys(!localExcludeBuys)}
            >
              <div className="relative aspect-square h-6 w-6 flex-shrink-0">
                <Image
                  src={
                    localExcludeBuys
                      ? "/icons/footer/checked.png"
                      : "/icons/footer/unchecked.png"
                  }
                  alt="Check / Unchecked Icon"
                  fill
                  quality={100}
                  className="object-contain"
                />
              </div>
              <span className="inline-block text-nowrap font-geistLight text-sm text-fontColorPrimary">
                Exclude Buys
              </span>
            </div>
          </div>

          {/* CTA */}
          <div className="flex w-full items-center gap-x-2">
            <button
              title="Reset"
              onClick={() => handleResetWalletTrackerFilter()}
              className="rounded-full bg-gray-800 p-1"
            >
              <RefreshCw size={16} />
            </button>
            <div className="w-full">
              <BaseButton
                onClick={() => {
                  handleApplyWalletTrackerFilter({
                    localMinSol,
                    localExcludeSells,
                    localExcludeBuys,
                  });
                }}
                variant="primary"
                className="w-full rounded-full"
              >
                <span className="font-geistSemiBold text-sm">Apply Filter</span>
              </BaseButton>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default WalletTrackerFilter;
