"use client";

import Image from "next/image";
import { cn } from "@/libraries/utils";
import Separator from "@/components/customs/Separator";
import { CachedImage } from "../../CachedImage";

export default function MostProfitableCard() {
  const MostProfitableCardDesktopContent = () => (
    <>
      <div className="hidden h-full w-full min-w-[160px] items-center md:flex">
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
      <div className="hidden h-full w-full min-w-[160px] items-center md:flex">
        <span className="inline-block text-nowrap font-geistSemiBold text-sm text-fontColorSecondary">
          $6.8K
        </span>
      </div>
      <div className="hidden h-full w-full min-w-[160px] items-center md:flex">
        <span className="inline-block text-nowrap font-geistSemiBold text-sm text-fontColorSecondary">
          $4.12K
        </span>
      </div>
      <div className="hidden h-full w-full min-w-[160px] items-center md:flex">
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
            0.0409
          </span>
        </div>
      </div>
      <div className="hidden h-full w-full min-w-[150px] items-center md:flex">
        <span className="inline-block text-nowrap font-geistSemiBold text-sm text-success">
          +1.4%
        </span>
      </div>
      <div className="hidden h-full w-full min-w-[75px] items-center md:flex">
        <button className="flex h-[28px] items-center gap-x-1.5 rounded-[4px] bg-success px-2 py-1">
          <span className="inline-block text-nowrap font-geistSemiBold text-sm text-[#10101E]">
            P&L
          </span>

          <Separator
            color="#202037"
            orientation="vertical"
            unit="fixed"
            fixedHeight={20}
            className="opacity-30"
          />

          <div className="relative aspect-square h-5 w-5 flex-shrink-0">
            <Image
              src="/icons/chevron-black.png"
              alt="Chevron Black"
              fill
              quality={100}
              className="object-contain"
            />
          </div>
        </button>
      </div>
    </>
  );

  const MostProfitableCardMobileContent = () => (
    <div className="flex w-full flex-col md:hidden">
      {/* Header */}
      <div className="relative flex h-12 w-full items-center overflow-hidden bg-white/[4%] px-3 py-3">
        <div className="flex items-center gap-x-3">
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

      {/* Market Data Grid */}
      <div className="grid grid-cols-5 gap-1 p-3">
        <div className="flex flex-col gap-y-1">
          <span className="text-nowrap text-xs text-fontColorSecondary">
            Invested
          </span>
          <span className="font-geistSemiBold text-sm text-fontColorSecondary">
            $6.8K
          </span>
        </div>

        <div className="flex flex-col gap-y-1">
          <span className="text-nowrap text-xs text-fontColorSecondary">
            Sold
          </span>
          <span className="font-geistSemiBold text-sm text-fontColorSecondary">
            $4.12K
          </span>
        </div>

        <div className="flex flex-col gap-y-1">
          <span className="text-nowrap text-xs text-fontColorSecondary">
            P&L
          </span>
          <div className="flex items-center gap-x-1">
            <div className="relative aspect-auto h-[16px] w-[16px]">
              <CachedImage
                src="/icons/solana-sq.svg"
                alt="Solana SQ Icon"
                fill
                quality={50}
                className="object-contain"
              />
            </div>
            <span className="font-geistSemiBold text-sm text-success">
              0.0409
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-y-1">
          <span className="text-nowrap text-xs text-fontColorSecondary">
            P&L %
          </span>
          <span className="font-geistSemiBold text-sm text-success">+1.4%</span>
        </div>

        <div className="ml-[-1rem] flex items-end">
          <button className="flex h-[28px] items-center gap-x-1.5 rounded-[4px] bg-success px-2 py-1">
            <span className="inline-block text-nowrap font-geistSemiBold text-sm text-[#10101E]">
              P&L
            </span>
            <Separator
              color="#202037"
              orientation="vertical"
              unit="fixed"
              fixedHeight={20}
              className="opacity-30"
            />
            <div className="relative aspect-square h-5 w-5 flex-shrink-0">
              <Image
                src="/icons/chevron-black.png"
                alt="Chevron Black"
                fill
                quality={100}
                className="object-contain"
              />
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div
      className={cn(
        "flex-shrink-0 items-center overflow-hidden from-background to-background-1",
        "max-md:rounded-[8px] max-md:border max-md:border-border max-md:bg-card",
        "md:flex md:h-[56px] md:min-w-max md:pl-4 md:pr-4 md:odd:bg-white/[4%] md:hover:bg-white/[8%]",
      )}
    >
      <MostProfitableCardDesktopContent />
      <MostProfitableCardMobileContent />
    </div>
  );
}
