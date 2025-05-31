"use client";

import { cn } from "@/libraries/utils";
import { usePopupStore } from "@/stores/use-popup-state";
import { formatNumber } from "@/utils/formatNumber";
import Image from "next/image";
import { CachedImage } from "../../CachedImage";
import GradientProgressBar from "../../GradientProgressBar";

interface Token {
  symbol: string;
  name: string;
  image: string | null;
  mint: string;
}

interface DeployedTokenData {
  token: Token;
  createdAt: number;
  marketCap: string;
  holders: number;
  priceUSD: string;
  liquidity: string;
}

interface DeployedTokensCardProps {
  isModalContent?: boolean;
  data: DeployedTokenData;
}

export default function DeployedTokensCard({
  isModalContent = true,
  data,
}: DeployedTokensCardProps) {
  const { remainingScreenWidth } = usePopupStore();

  const DeployedTokensCardDesktopContent = () => (
    <>
      <div className="hidden h-full w-full min-w-[80px] items-center md:flex">
        <div className="flex items-center gap-x-2">
          <span className="line-clamp-1 inline-block text-nowrap font-geistSemiBold text-sm text-fontColorPrimary">
            {new Date(data.createdAt * 1000).toLocaleDateString()}
          </span>
        </div>
      </div>
      <div className="hidden h-full w-full min-w-[125px] items-center md:flex">
        <span className="inline-block text-nowrap font-geistSemiBold text-sm text-fontColorPrimary">
          ${formatNumber(Number(data.marketCap))}
        </span>
      </div>
      <div className="hidden h-full w-full min-w-[125px] items-center md:flex">
        <span className="inline-block text-nowrap font-geistSemiBold text-sm text-fontColorPrimary">
          {formatNumber(data.holders)}
        </span>
      </div>
      <div className="hidden h-full w-full min-w-[150px] items-center md:flex">
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
          <span className="inline-block text-nowrap font-geistSemiBold text-sm text-destructive">
            -0.0409
          </span>
        </div>
      </div>
      <div className="flex min-w-[230px] flex-col justify-end gap-y-1 max-md:hidden lg:min-w-[265px]">
        <div className="relative z-20 flex w-[80%] items-center gap-x-[10px]">
          <GradientProgressBar bondingCurveProgress={54} />
          <span className="inline-block text-nowrap font-geistSemiBold text-xs text-fontColorPrimary">
            {54}%
          </span>
        </div>
      </div>
    </>
  );

  const DeployedTokensCardMobileContent = () => (
    <div
      className={cn(
        "flex w-full flex-col md:hidden",
        remainingScreenWidth < 700 && !isModalContent && "md:flex",
      )}
    >
      {/* Market Data Grid */}
      <div className="flex justify-around gap-2.5 p-3">
        <div className="flex flex-col gap-y-1">
          <span className="text-nowrap text-xs text-fontColorSecondary">
            Created
          </span>
          <span className="font-geistSemiBold text-sm text-fontColorPrimary">
            {new Date(data.createdAt * 1000).toLocaleDateString()}
          </span>
        </div>

        <div className="flex flex-col gap-y-1">
          <span className="text-nowrap text-xs text-fontColorSecondary">
            MC
          </span>
          <span className="font-geistSemiBold text-sm text-fontColorPrimary">
            ${formatNumber(Number(data.marketCap))}
          </span>
        </div>

        <div className="flex flex-col gap-y-1">
          <span className="text-nowrap text-xs text-fontColorSecondary">
            Holders
          </span>
          <span className="font-geistSemiBold text-sm text-fontColorPrimary">
            {formatNumber(data.holders)}
          </span>
        </div>

        <div className="flex flex-col gap-y-1">
          <span className="text-nowrap text-xs text-fontColorSecondary">
            P&L
          </span>
          <div className="flex items-center gap-x-1">
            <div className="relative aspect-auto h-[16px] w-[16px] shrink-0">
              <Image
                src="/icons/solana-sq.svg"
                alt="Solana SQ Icon"
                fill
                quality={50}
                className="object-contain"
              />
            </div>
            <span className="font-geistSemiBold text-sm text-destructive">
              -0.0409
            </span>
          </div>
        </div>

        <div className="flex w-[30%] flex-col justify-end gap-y-1">
          <span className="truncate text-nowrap font-geistRegular text-xs text-fontColorSecondary">
            Bonding Curve Progress
          </span>
          <div className="relative z-20 flex w-full items-center gap-x-[10px]">
            <GradientProgressBar bondingCurveProgress={54} />
            <span className="inline-block text-nowrap font-geistSemiBold text-xs text-fontColorPrimary">
              {54}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div
      className={cn(
        "items-center overflow-hidden",
        "max-md:rounded-[8px] max-md:border max-md:border-border max-md:bg-card",
        "md:flex md:h-[56px] md:min-w-max md:rounded-none md:pl-4 md:hover:bg-white/[4%]",
        remainingScreenWidth < 700 &&
          !isModalContent &&
          "mb-2 rounded-[8px] border border-border bg-card md:h-fit md:pl-0",
      )}
    >
      {remainingScreenWidth < 700 && !isModalContent ? null : (
        <DeployedTokensCardDesktopContent />
      )}
      <DeployedTokensCardMobileContent />
    </div>
  );
}

