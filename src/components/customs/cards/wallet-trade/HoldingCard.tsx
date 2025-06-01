"use client";

import Image from "next/image";
import { cn } from "@/libraries/utils";

export default function HoldingCard() {
  const HoldingCardDesktopContent = () => (
    <>
      <div className="hidden h-full w-full min-w-[180px] items-center md:flex">
        <div className="flex items-center gap-x-2">
          <div className="relative aspect-square h-6 w-6 flex-shrink-0">
            <Image
              src="/images/trade-history-token.png"
              alt="Trade History Token Image"
              fill
              quality={100}
              className="object-contain"
            />
          </div>
          <span className="line-clamp-1 inline-block text-nowrap font-geistSemiBold text-sm text-fontColorPrimary">
            DEGEMG
          </span>
        </div>
      </div>
      <div className="hidden h-full w-full min-w-[175px] items-center md:flex">
        <span className="inline-block text-nowrap font-geistSemiBold text-sm text-fontColorPrimary">
          $6.8K
        </span>
      </div>
      <div className="hidden h-full w-full min-w-[175px] items-center md:flex">
        <span className="inline-block text-nowrap font-geistSemiBold text-sm text-fontColorPrimary">
          $4.12K
        </span>
      </div>
      <div className="hidden h-full w-full min-w-[175px] items-center md:flex">
        <span className="inline-block text-nowrap font-geistSemiBold text-sm text-fontColorPrimary">
          $4.12K
        </span>
      </div>
      <div className="hidden h-full w-full min-w-[175px] items-center md:flex">
        <div className="flex items-center gap-x-[4px]">
          <div className="relative aspect-auto h-[16px] w-[16px] flex-shrink-0">
            <Image
              src="/icons/solana-sq.svg"
              alt="Solana SQ Icon"
              fill
              quality={50}
              className="object-contain"
            />
          </div>
          <span className="inline-block text-nowrap font-geistSemiBold text-sm text-success">
            +0.0409
          </span>
        </div>
      </div>
    </>
  );

  const HoldingCardMobileContent = () => (
    <div className="flex w-full flex-col md:hidden">
      {/* Header */}
      <div className="relative flex h-12 w-full items-center overflow-hidden bg-white/[4%] px-3 py-3">
        <div className="flex items-center gap-x-3">
          <div className="flex items-center gap-x-2">
            <div className="relative aspect-square h-6 w-6 flex-shrink-0">
              <Image
                src="/images/trade-history-token.png"
                alt="Trade History Token Image"
                fill
                quality={100}
                className="object-contain"
              />
            </div>
            <span className="text-nowrap font-geistSemiBold text-sm text-fontColorPrimary">
              DEGEMG
            </span>
          </div>
        </div>
      </div>

      {/* Market Data Grid */}
      <div className="grid grid-cols-4 gap-2 p-3">
        <div className="flex flex-col gap-y-1">
          <span className="text-nowrap text-xs text-fontColorPrimary">
            Invested
          </span>
          <span className="font-geistSemiBold text-sm text-fontColorPrimary">
            $6.8K
          </span>
        </div>

        <div className="flex flex-col gap-y-1">
          <span className="text-nowrap text-xs text-fontColorPrimary">
            Sold
          </span>
          <span className="font-geistSemiBold text-sm text-fontColorPrimary">
            $4.12K
          </span>
        </div>

        <div className="flex flex-col gap-y-1">
          <span className="text-nowrap text-xs text-fontColorPrimary">
            Remaining
          </span>
          <span className="font-geistSemiBold text-sm text-fontColorPrimary">
            $4.12K
          </span>
        </div>

        <div className="flex flex-col gap-y-1">
          <span className="text-nowrap text-xs text-fontColorPrimary">
            P&L %
          </span>
          <div className="flex items-center gap-x-1">
            <div className="relative aspect-auto h-[16px] w-[16px]">
              <Image
                src="/icons/solana-sq.svg"
                alt="Solana SQ Icon"
                fill
                quality={50}
                className="object-contain"
              />
            </div>
            <span className="font-geistSemiBold text-sm text-success">
              +0.0409
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div
      className={cn(
        "flex-shrink-0 items-center overflow-hidden",
        "max-md:rounded-[8px] max-md:border max-md:border-border max-md:bg-card",
        "md:flex md:h-[56px] md:min-w-max md:pl-4 md:pr-4 md:odd:bg-white/[4%] md:hover:bg-white/[8%]",
      )}
    >
      <HoldingCardDesktopContent />
      <HoldingCardMobileContent />
    </div>
  );
}
