"use client";

import Image from "next/image";
import { cn } from "@/libraries/utils";
import SellBuyBadge from "../../SellBuyBadge";
import CircleCount from "../../CircleCount";
import AddressWithEmojis from "../../AddressWithEmojis";
import { CachedImage } from "../../CachedImage";

export default function TradeHistoryCard() {
  const TradeHistoryCardDesktopContent = () => (
    <>
      <div className="hidden h-full w-full min-w-[72px] items-center md:flex">
        <span className="inline-block text-nowrap font-geistSemiBold text-sm text-fontColorPrimary">
          2m
        </span>
      </div>
      <div className="hidden h-full w-full min-w-[144px] items-center md:flex">
        <div className="flex items-center gap-x-2">
          <SellBuyBadge type="buy" size="sm" />
          <div className="relative aspect-square h-6 w-6 flex-shrink-0">
            <Image
              src="/images/trade-history-token.png"
              alt="Trade History Token Image"
              fill
              quality={100}
              className="object-contain"
            />
          </div>
          <span className="line-clamp-1 inline-block text-nowrap font-geistSemiBold text-xs text-fontColorSecondary">
            DEGEMG
          </span>
        </div>
      </div>
      <div className="hidden h-full w-full min-w-[152px] items-center md:flex">
        <span className="inline-block text-nowrap font-geistSemiBold text-sm text-success">
          $860K
        </span>
      </div>
      <div className="hidden h-full w-full min-w-[155px] items-center md:flex">
        <span className="inline-block text-nowrap font-geistSemiBold text-sm text-success">
          2.1K
        </span>
      </div>
      <div className="hidden h-full w-full min-w-[185px] items-center md:flex">
        <div className="flex items-center gap-x-[4px]">
          <div className="relative aspect-auto h-[16px] w-[16px] flex-shrink-0">
            <CachedImage
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
      <div className="hidden h-full w-full min-w-[155px] items-center justify-end md:flex">
        <div className="flex items-center gap-x-1">
          <AddressWithEmojis
            address="$DUm...vcJ"
            emojis={["whale.png", "dolphin.png"]}
            color="success"
          />
          <CircleCount value={1} />
        </div>
      </div>
    </>
  );

  const TradeHistoryCardMobileContent = () => (
    <div className="flex w-full flex-col md:hidden">
      {/* Header */}
      <div className="relative flex h-12 w-full items-center justify-between overflow-hidden bg-white/[4%] px-3 py-3">
        <div className="flex items-center gap-x-3">
          <SellBuyBadge isExpanded type="buy" size="sm" />
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

        <div className="flex items-center gap-x-2">
          <span className="text-xs text-fontColorSecondary">
            2m
            <span className="ml-1 font-geistSemiBold text-fontColorPrimary">
              Ago
            </span>
          </span>
        </div>
      </div>

      {/* Market Data Grid */}
      <div className="grid grid-cols-5 gap-2 p-3">
        <div className="flex flex-col gap-y-1">
          <span className="text-nowrap text-xs text-fontColorSecondary">
            Market Cap
          </span>
          <span className="font-geistSemiBold text-sm text-success">$860K</span>
        </div>

        <div className="flex flex-col gap-y-1">
          <span className="text-nowrap text-xs text-fontColorSecondary">
            Price
          </span>
          <span className="font-geistSemiBold text-sm text-success">2.1K</span>
        </div>

        <div className="flex flex-col gap-y-1">
          <span className="text-nowrap text-xs text-fontColorSecondary">
            Tokens
          </span>
          <span className="font-geistSemiBold text-sm text-success">2.1K</span>
        </div>

        <div className="flex flex-col gap-y-1">
          <span className="text-nowrap text-xs text-fontColorSecondary">
            SOL
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
            USDC
          </span>
          <span className="font-geistSemiBold text-sm text-success">$860K</span>
        </div>
      </div>

      <div className="flex items-center justify-end gap-x-1 border-t border-border p-3">
        <AddressWithEmojis
          color="success"
          address={"6G1...ump"}
          emojis={["whale.png", "dolphin.png"]}
        />
        <CircleCount value={1} />
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
      <TradeHistoryCardDesktopContent />
      <TradeHistoryCardMobileContent />
    </div>
  );
}
