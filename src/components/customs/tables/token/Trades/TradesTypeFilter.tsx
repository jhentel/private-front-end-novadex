import BaseButton from "@/components/customs/buttons/BaseButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/libraries/utils";
import { useTokenCardsFilter } from "@/stores/token/use-token-cards-filter.store";
import { PopoverClose } from "@radix-ui/react-popover";
import Image from "next/image";
import React, { useState } from "react";

const TradesTypeFilter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const setTypeFilter = useTokenCardsFilter((state) => state.setTradesType);
  const [typeFilterTemp, setTypeFilterTemp] = useState({
    buy: true,
    sell: true,
    add: true,
    remove: true,
  });
  return (
    <>
      <Popover onOpenChange={setIsOpen} open={isOpen}>
        <PopoverTrigger asChild>
          <button className="relative inline-block size-3">
            <Image
              src="/icons/filter.svg"
              alt="Filter icon"
              width={24}
              height={24}
              className="object-contain"
            />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          sideOffset={6}
          className={cn(
            "gb__white__popover h-auto w-[240px] rounded-[8px] border border-border p-0",
          )}
        >
          <div className="flex w-full items-center justify-start border-b border-border px-4 max-md:h-[56px] md:p-4">
            <h4 className="text-nowrap font-geistSemiBold text-[18px] text-fontColorPrimary">
              Type Filter
            </h4>
            <PopoverClose
              maker-close-button
              className="ml-auto hidden cursor-pointer text-fontColorSecondary md:inline-block"
            >
              <div className="relative aspect-square h-6 w-6 flex-shrink-0 duration-300 hover:opacity-70">
                <Image
                  src="/icons/close.png"
                  alt="Close Icon"
                  fill
                  quality={100}
                  className="object-contain"
                />
              </div>
            </PopoverClose>
          </div>
          <div className="relative flex w-full flex-grow flex-col gap-y-2 p-4">
            <div
              onClick={() =>
                setTypeFilterTemp({
                  ...typeFilterTemp,
                  buy: !typeFilterTemp.buy,
                })
              }
              className="flex h-8 w-full cursor-pointer items-center justify-between gap-x-2 rounded-[8px] border border-border py-1 pl-2 pr-1"
            >
              <span className="inline-block text-nowrap font-geistLight text-sm text-fontColorPrimary">
                Buy
              </span>
              <div className="relative aspect-square h-6 w-6 flex-shrink-0">
                <Image
                  src={
                    typeFilterTemp.buy
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
                setTypeFilterTemp({
                  ...typeFilterTemp,
                  sell: !typeFilterTemp.sell,
                })
              }
              className="flex h-8 w-full cursor-pointer items-center justify-between gap-x-2 rounded-[8px] border border-border py-1 pl-2 pr-1"
            >
              <span className="inline-block text-nowrap font-geistLight text-sm text-fontColorPrimary">
                Sell
              </span>
              <div className="relative aspect-square h-6 w-6 flex-shrink-0">
                <Image
                  src={
                    typeFilterTemp.sell
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
            {/* <div
              onClick={() =>
                setTypeFilterTemp({
                  ...typeFilterTemp,
                  add: !typeFilterTemp.add,
                })
              }
              className="flex h-8 w-full cursor-pointer items-center justify-between gap-x-2 rounded-[8px] border border-border py-1 pl-2 pr-1"
            >
              <span className="inline-block text-nowrap font-geistLight text-sm text-fontColorPrimary">
                Add
              </span>
              <div className="relative aspect-square h-6 w-6 flex-shrink-0">
                <Image
                  src={
                    typeFilterTemp.add
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
                setTypeFilterTemp({
                  ...typeFilterTemp,
                  remove: !typeFilterTemp.remove,
                })
              }
              className="flex h-8 w-full cursor-pointer items-center justify-between gap-x-2 rounded-[8px] border border-border py-1 pl-2 pr-1"
            >
              <span className="inline-block text-nowrap font-geistLight text-sm text-fontColorPrimary">
                Remove
              </span>
              <div className="relative aspect-square h-6 w-6 flex-shrink-0">
                <Image
                  src={
                    typeFilterTemp.remove
                      ? "/icons/footer/checked.png"
                      : "/icons/footer/unchecked.png"
                  }
                  alt="Check / Unchecked Icon"
                  fill
                  quality={100}
                  className="object-contain"
                />
              </div>
            </div> */}
          </div>
          <div className="flex h-[64px] w-full items-center justify-between gap-x-3 rounded-b-[8px] border border-t border-border bg-[#080811] p-4">
            <button
              onClick={() => {
                setTypeFilterTemp({
                  buy: true,
                  sell: true,
                  add: true,
                  remove: true,
                });
                setTypeFilter({
                  buy: true,
                  sell: true,
                  add: true,
                  remove: true,
                });
                setIsOpen(false);
              }}
              className="font-geistSemiBold text-sm text-primary duration-300 hover:text-[#be7ad2]"
            >
              Clear
            </button>
            <BaseButton
              onClick={() => {
                setTypeFilter(typeFilterTemp);
                setIsOpen(false);
              }}
              type="button"
              variant="primary"
              className="h-8 w-[63px]"
            >
              <span className="text-sm">Apply</span>
            </BaseButton>
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
};

export default TradesTypeFilter;
