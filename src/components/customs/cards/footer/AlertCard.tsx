"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "nextjs-toploader/app";
// ######## Components 🧩 ########
import Image from "next/image";
import Link from "next/link";
import BaseButton from "@/components/customs/buttons/BaseButton";
import SellBuyBadge from "@/components/customs/SellBuyBadge";
import Copy from "@/components/customs/Copy";
import AvatarWithBadges, {
  BadgeType,
} from "@/components/customs/AvatarWithBadges";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";
import {
  formatAmountWithoutLeadingZero,
  formatAmount,
  formatAmountDollar,
} from "@/utils/formatAmount";
import { truncateAddress } from "@/utils/truncateAddress";
// ######## Types 🗨️ ########
import { Alert } from "@/types/alerts";
import { useQueryClient } from "@tanstack/react-query";
import { prefetchTokenData } from "@/utils/prefetch";
import { prefetchChart } from "@/apis/rest/charts";
import { useWindowSizeStore } from "@/stores/use-window-size.store";

interface AlertCardProps {
  alert: Alert;
  type: "buy" | "sell";
  index?: number;
}

const WalletTriggerContent = ({
  address,
  type,
}: {
  address: string;
  type: "sell" | "buy";
}) => (
  <div className="flex items-center gap-x-1">
    <span
      className={cn(
        "inline-block text-nowrap font-geistSemiBold text-xs text-primary underline decoration-dashed",
        type === "sell" ? "text-destructive" : "text-success",
      )}
    >
      {truncateAddress(address)}
    </span>
    <Copy value={address} />
  </div>
);

const formatTimeAgo = (timestamp: number): string => {
  const seconds = Math.floor(Date.now() / 1000 - timestamp);

  if (seconds < 60) return `${seconds}s`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;

  const weeks = Math.floor(days / 7);
  if (weeks < 52) return `${weeks}w`;

  const years = Math.floor(weeks / 52);
  return `${years}y`;
};

export default React.memo(function AlertCard({
  alert,
  type,
  index,
}: AlertCardProps) {
  const width = useWindowSizeStore((state) => state.width);
  // Capitalize first letter
  const status = alert.status.charAt(0).toUpperCase() + alert.status.slice(1);
  // Add state for timeAgo to allow updates
  const [timeAgo, setTimeAgo] = useState<string>(
    formatTimeAgo(alert.timestamp),
  );

  // Add interval to update timeAgo every second
  useEffect(() => {
    // Initial update
    setTimeAgo(formatTimeAgo(alert.timestamp));

    // Set up interval
    const interval = setInterval(() => {
      setTimeAgo(formatTimeAgo(alert.timestamp));
    }, 1000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [alert.timestamp]);

  const router = useRouter();

  const handleGoogleLensSearch = useCallback(
    (event: React.MouseEvent, imageUrl: string) => {
      event.stopPropagation();
      window.open(
        `https://lens.google.com/uploadbyurl?url=${encodeURIComponent(imageUrl)}`,
        "_blank",
      );
    },
    [],
  );

  const tokenUrl = useMemo(() => {
    if (!alert?.mint) return "#";

    const params = new URLSearchParams({
      symbol: alert?.symbol || "",
      name: alert?.name || "",
      image: alert?.image || "",
      dex: alert?.dex || "",
    });

    return `/token/${alert.mint}?${params.toString()}`;
  }, [alert?.image, alert?.dex]);

  const queryClient = useQueryClient();
  let hoverTimeout: NodeJS.Timeout;

  return (
    <div
      className={cn(
        "flex-shrink-0 items-center overflow-hidden from-background to-background-1",
        "border-border max-md:rounded-[8px] max-md:bg-card",
        "transition-color border duration-300 ease-out hover:bg-white/10 md:flex md:h-[64px] md:min-w-max md:border-0 md:pl-4 md:pr-1",
        index! % 2 === 0 ? "" : "md:bg-shadeTable md:hover:bg-shadeTableHover",
      )}
    >
      {/* Desktop */}
      {width! >= 768 && (
        <div className="hidden h-[64px] w-full min-w-max items-center md:flex">
          <div className="flex h-full w-full min-w-[60px] items-center">
            <span className="text-nowrap font-geistSemiBold text-xs text-fontColorPrimary">
              {timeAgo}
            </span>
          </div>
          <div className="flex h-full w-full min-w-[60px] items-center">
            <SellBuyBadge type={type} />
          </div>
          <div className="flex h-full w-full min-w-[190px] items-center">
            <div className="flex items-center gap-x-2">
              <div className="relative aspect-square h-8 w-8 flex-shrink-0">
                <AvatarWithBadges
                  src={alert?.image}
                  symbol={alert?.symbol}
                  alt={`${alert?.name} Image`}
                  size="sm"
                  rightType={
                    alert?.dex
                      ?.replace(/\./g, "")
                      ?.replace(/ /g, "_")
                      ?.toLowerCase() as BadgeType
                  }
                  handleGoogleLensSearch={(e) =>
                    handleGoogleLensSearch(e, alert.image)
                  }
                  rightClassName="!size-3.5 -right-0.5 -bottom-[1.5px]"
                  cameraIconClassname="text-[24px]"
                />
              </div>
              <div className="flex flex-col items-start gap-y-1">
                <div
                  onClick={() => {
                    router.push(tokenUrl);
                    prefetchChart(queryClient, alert.mint);

                    // setTimeout(() => {
                    //   prefetchCandles(alert);
                    // }, 10);
                  }}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    window.open(tokenUrl, "_blank");
                  }}
                  className="line-clamp-1 inline-block max-w-[80px] cursor-pointer overflow-hidden truncate text-nowrap font-geistSemiBold text-xs text-fontColorPrimary"
                >
                  {alert.name}
                </div>
                <div className="-mt-0.5 flex items-center gap-x-1">
                  <span className="inline-block text-nowrap text-xs uppercase text-fontColorSecondary">
                    {truncateAddress(alert.mint)}
                  </span>
                  <Copy value={alert.mint} />
                </div>
              </div>
            </div>
          </div>
          <div className="flex h-full w-full min-w-[110px] items-center">
            <div className="flex w-fit flex-col justify-center">
              <div className="flex items-center gap-x-1">
                <div className="relative aspect-square h-4 w-4 flex-shrink-0">
                  <Image
                    src="/icons/solana-sq.svg"
                    alt="Solana SQ Icon"
                    fill
                    quality={100}
                    className="object-contain"
                  />
                </div>
                <span
                  className={cn(
                    "inline-block text-nowrap font-geistSemiBold text-xs",
                    type === "sell" ? "text-destructive" : "text-success",
                  )}
                >
                  {formatAmountWithoutLeadingZero(Number(alert.solAmount))}
                </span>
              </div>
              <div className="flex items-center gap-x-1">
                <span
                  className={cn(
                    "inline-block text-nowrap text-xs text-fontColorSecondary",
                    type === "sell" ? "text-destructive" : "text-success",
                  )}
                >
                  {formatAmountWithoutLeadingZero(alert.tokenAmount)}
                </span>
              </div>
            </div>
          </div>
          <div className="flex h-full w-full min-w-[110px] items-center">
            <div className="flex w-fit flex-col justify-center">
              <div className="flex items-center gap-x-1">
                <span
                  className={cn(
                    "inline-block text-nowrap text-xs text-fontColorPrimary",
                    type === "sell" ? "text-destructive" : "text-success",
                  )}
                >
                  {formatAmountDollar(alert.marketCap)}
                </span>
              </div>
            </div>
          </div>
          <div className="flex h-full w-full min-w-[130px] items-center gap-x-1">
            <h4
              className={cn(
                "text-nowrap font-geistSemiBold text-xs",
                type === "buy" ? "text-success" : "text-destructive",
              )}
            >
              {truncateAddress(alert.walletName)}
            </h4>
          </div>
          <div className="flex h-full w-full min-w-[100px] items-center">
            <div className="flex items-center gap-x-2">
              <div className="relative inline-block h-4 w-4">
                <Image
                  src={`/icons/footer/${alert.status === "success" ? "alert-success" : "alert-failed"}.svg`}
                  alt="Alert Status"
                  fill
                />
              </div>

              <span
                className={cn(
                  "font-geistSemiBold text-sm",
                  alert.status === "success"
                    ? "text-success"
                    : "text-destructive",
                )}
              >
                {alert.module}
              </span>
            </div>
          </div>

          <div className="flex h-full w-full min-w-[45px] items-center justify-center">
            <div className="flex items-center gap-x-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href={`https://solscan.io/tx/${alert.signature}`}
                      target="_blank"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <BaseButton
                        size="short"
                        variant="gray"
                        className="size-[32px] rounded-[8px]"
                      >
                        <div className="relative aspect-square h-4 w-4 flex-shrink-0">
                          <Image
                            src="/icons/token/actions/coin.png"
                            alt="Coin Icon"
                            fill
                            quality={100}
                            className="object-contain"
                          />
                        </div>
                      </BaseButton>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="px-2 py-1">
                    <span className="inline-block text-nowrap text-xs">
                      SolScan
                    </span>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      )}

      {/* MOBILE */}
      {width! < 768 && (
        <div className="flex w-full flex-col md:hidden">
          {/* Header */}
          <div className="relative flex h-8 w-full items-center justify-between overflow-hidden bg-white/[4%] px-3 py-5">
            <div className="relative z-20 flex items-center gap-x-2">
              <SellBuyBadge type={type} />
              <div className="relative aspect-square h-7 w-7 flex-shrink-0">
                <AvatarWithBadges
                  src={alert?.image}
                  symbol={alert?.symbol}
                  alt={`${alert?.name} Image`}
                  rightType={
                    alert?.dex
                      ?.replace(/\./g, "")
                      ?.replace(/ /g, "_")
                      ?.toLowerCase() as BadgeType
                  }
                  handleGoogleLensSearch={(e) =>
                    handleGoogleLensSearch(e, alert.image)
                  }
                  rightClassName="!size-3.5 -right-0.5 -bottom-[1.5px]"
                  cameraIconClassname="text-[20px]"
                />
              </div>
              <div
                onClick={() => {
                  router.push(tokenUrl);
                  prefetchChart(queryClient, alert.mint);

                  // setTimeout(() => {
                  //   prefetchCandles(data.mint);
                  // }, 10);
                }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.open(tokenUrl, "_blank");
                }}
                className="text-nowrap font-geistSemiBold text-xs text-fontColorPrimary hover:cursor-pointer"
              >
                {alert.name}
              </div>
              <Copy value={alert.name} />
            </div>
            <span className="relative z-20 text-nowrap font-geistSemiBold text-xs text-fontColorPrimary">
              {timeAgo}
            </span>
          </div>

          {/* Content */}
          <div className="relative flex w-full justify-between gap-x-4 p-3">
            {/* Wallet */}
            <div className="flex flex-col gap-y-1">
              <span className="text-xs text-fontColorSecondary">Wallet</span>
              <div className="flex h-full w-full items-center gap-x-1">
                <Image
                  src="/icons/footer/whale.png"
                  quality={100}
                  width={12}
                  height={12}
                  alt="whale icon"
                />
                <Image
                  src="/icons/footer/dolphin.png"
                  quality={100}
                  width={12}
                  height={12}
                  alt="whale icon"
                />
              </div>
              <h4
                className={cn(
                  "text-nowrap font-geistSemiBold text-xs",
                  alert.module === "Quick Buy" || alert.module === "Buy Sniper"
                    ? "text-success"
                    : "text-destructive",
                )}
              >
                {truncateAddress(alert.walletName)}
              </h4>
            </div>

            {/* Amount */}
            <div className="flex flex-col gap-y-1">
              <span className="text-xs text-fontColorSecondary">Amount</span>
              <span className="flex items-center gap-1 text-xs text-fontColorPrimary">
                <div className="relative aspect-square h-4 w-4 flex-shrink-0">
                  <Image
                    src="/icons/solana-sq.svg"
                    alt="Solana SQ Icon"
                    fill
                    quality={100}
                    className="object-contain"
                  />
                </div>
                {formatAmountWithoutLeadingZero(Number(alert.solAmount))}
              </span>
            </div>

            {/* Market Cap */}
            <div className="flex flex-col gap-y-1">
              <span className="whitespace-nowrap text-xs text-fontColorSecondary">
                Market Cap
              </span>
              <span className="text-xs text-fontColorPrimary">
                {formatAmountDollar(alert.marketCap)}
              </span>
            </div>

            {/* Modules */}
            <div className="flex items-center justify-end">
              <span
                className={cn(
                  "font-geistSemiBold text-xs",
                  alert.module === "Quick Buy" || alert.module === "Buy Sniper"
                    ? "text-success"
                    : "text-destructive",
                )}
              >
                {alert.module}
              </span>
            </div>

            {/* Status */}
            <div className="flex items-center justify-end">
              <span
                className={cn(
                  "font-geistSemiBold text-xs",
                  status === "Success" ? "text-success" : "text-destructive",
                )}
              >
                {status}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href={`https://solscan.io/tx/${alert.signature}`}
                      target="_blank"
                    >
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
                            quality={100}
                            className="object-contain"
                          />
                        </div>
                      </BaseButton>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="px-2 py-1">
                    <span className="inline-block text-nowrap text-xs">
                      SolScan
                    </span>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
