"use client";

// ######## Components 🧩 ########
import Image from "next/image";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import BaseButton from "@/components/customs/buttons/BaseButton";
import React from "react";

type TradesButtonsProps = {
  setWalletFilter: (value: string) => void;
  walletFilter: string;
  wallet: string;
  hash: string;
};

export default React.memo(function TradesButtons({
  setWalletFilter,
  walletFilter,
  wallet,
  hash,
}: TradesButtonsProps) {
  // Filter Configuration 🔍
  const handleFilter = () => {
    if (walletFilter.length > 0) {
      setWalletFilter("");
    } else {
      setWalletFilter(wallet);
    }
  };

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <BaseButton
              onClick={handleFilter}
              size="short"
              variant="gray"
              className="size-[32px] rounded-[8px]"
            >
              <div className="relative z-30 aspect-square h-4 w-4 flex-shrink-0">
                <Image
                  src="/icons/token/actions/filter.png"
                  alt="Filter Icon"
                  fill
                  quality={30}
                  className="object-contain"
                />
              </div>
            </BaseButton>
          </TooltipTrigger>
          <TooltipContent side="top" className="px-2 py-1">
            <span className="inline-block text-nowrap text-xs">Filter</span>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href={`https://solscan.io/tx/${hash}`} target="_blank">
              <BaseButton
                size="short"
                variant="gray"
                className="size-[32px] rounded-[8px]"
              >
                <div className="relative z-30 aspect-square h-4 w-4 flex-shrink-0">
                  <Image
                    src="/icons/token/actions/coin.png"
                    alt="Coin Icon"
                    fill
                    quality={30}
                    className="object-contain"
                  />
                </div>
              </BaseButton>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="top" className="px-2 py-1">
            <span className="inline-block text-nowrap text-xs">SolScan</span>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </>
  );
});
