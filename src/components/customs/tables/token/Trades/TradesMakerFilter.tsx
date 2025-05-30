import BaseButton from "@/components/customs/buttons/BaseButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/libraries/utils";
import { PopoverClose } from "@radix-ui/react-popover";
import Image from "next/image";
import React from "react";

const TradesMakerFilter = ({
  openWalletMakerFilter,
  setOpenWalletMakerFilter,
  walletFilterTemp,
  setWalletFilterTemp,
  setWalletFilter,
}: {
  openWalletMakerFilter: boolean;
  setOpenWalletMakerFilter: React.Dispatch<React.SetStateAction<boolean>>;
  walletFilterTemp: string;
  setWalletFilterTemp: (value: string) => void;
  setWalletFilter: (value: string) => void;
}) => {
  return (
    <>
      <Popover
        open={openWalletMakerFilter}
        onOpenChange={setOpenWalletMakerFilter}
      >
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
            "gb__white__popover h-auto w-[320px] rounded-[8px] border border-border p-0",
          )}
        >
          <div className="flex w-full items-center justify-start border-b border-border px-4 max-md:h-[56px] md:p-4">
            <h4 className="text-nowrap font-geistSemiBold text-[18px] text-fontColorPrimary">
              Filter by Maker
            </h4>
            <PopoverClose
              maker-close-button="true"
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
          <div className="relative flex w-full flex-grow flex-col px-4 pb-3 pt-2">
            <div className="flex flex-grow flex-col gap-1">
              <Label className="text-xs text-fontColorSecondary">
                Wallet Address
              </Label>
              <Input
                value={walletFilterTemp}
                onChange={(e) => {
                  setWalletFilterTemp(e.target.value);
                }}
                placeholder="Wallet Address"
                className="h-[32px] border border-border placeholder:text-fontColorSecondary focus:outline-none"
              />
            </div>
          </div>
          <div className="flex h-[64px] w-full items-center justify-between gap-x-3 rounded-b-[8px] border border-t border-border bg-[#080811] p-4">
            <button
              onClick={() => {
                setWalletFilterTemp("");
                setWalletFilter("");
                setOpenWalletMakerFilter(false);
              }}
              className="font-geistSemiBold text-sm text-primary duration-300 hover:text-[#be7ad2]"
            >
              Clear
            </button>
            <BaseButton
              onClick={() => {
                setWalletFilter(walletFilterTemp);
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

export default TradesMakerFilter;
