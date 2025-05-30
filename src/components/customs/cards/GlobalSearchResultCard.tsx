"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import React, { useCallback, useMemo, forwardRef } from "react";
import { SearchTokenResult } from "@/types/search";
// ######## Components 🧩 ########
import AvatarWithBadges, {
  BadgeType,
} from "@/components/customs/AvatarWithBadges";
import Copy from "@/components/customs/Copy";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";
import { truncateString } from "@/utils/truncateString";
import { formatTimeAgo } from "@/utils/formatDate";
import { useRouter } from "nextjs-toploader/app";
import {
  RecentToken,
  useRecentSearchTokensStore,
} from "@/stores/use-recent-search-tokens";
import { prefetchCandles, prefetchChart } from "@/apis/rest/charts";
import { useQueryClient } from "@tanstack/react-query";
import { useWindowSizeStore } from "@/stores/use-window-size.store";

export type GlobalSearchResultCardProps = SearchTokenResult & {
  isFocused?: boolean;
  setOpenDialog?: (value: boolean) => void;
};

// Create a forwardRef wrapper component to handle the ref forwarding to the <a> element
const GlobalSearchResultCard = forwardRef<
  HTMLDivElement,
  GlobalSearchResultCardProps
>(function GlobalSearchResultCard(
  {
    dex,
    image,
    liquidity,
    marketCap,
    priceChange,
    mint,
    name,
    symbol,
    volume,
    createdAt,
    isFocused = false,
    setOpenDialog,
  },
  ref,
) {
  const router = useRouter();

  const handleGoogleLensSearch = useCallback(
    (event: React.MouseEvent, imageUrl: string | undefined) => {
      event.stopPropagation();
      event.preventDefault();
      if (!imageUrl) return;

      window.open(
        `https://lens.google.com/uploadbyurl?url=${encodeURIComponent(imageUrl)}`,
        "_blank",
      );
    },
    [],
  );

  const tokenUrl = useMemo(() => {
    if (!mint) return "#";

    const params = new URLSearchParams({
      symbol: symbol || "",
      name: name || "",
      image: image || "",
      dex: dex || "",
    });

    return `/token/${mint}?${params.toString()}`;
  }, [symbol, name, image, dex]);

  const { recentTokens, setRecentSearchTokens } = useRecentSearchTokensStore();
  const queryClient = useQueryClient();
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setOpenDialog?.(false);
    const token = { dex, image, mint, symbol } as RecentToken;
    const updatedTokens = recentTokens.filter(
      (existingToken) => existingToken.mint !== token.mint,
    );
    setRecentSearchTokens([token, ...updatedTokens]);

    router.push(tokenUrl);
    prefetchChart(queryClient, mint);
    prefetchCandles(queryClient, {
      mint: mint,
      interval: localStorage.getItem("chart_interval_resolution") || "1s",
      currency: (
        (localStorage.getItem("chart_currency") as string) || "SOL"
      ).toLowerCase() as "sol" | "usd",
      initial: true,
    });
  };

  const handleCardContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const token = { dex, image, mint, symbol } as RecentToken;
      const updatedTokens = recentTokens.filter(
        (existingToken) => existingToken.mint !== token.mint,
      );
      setRecentSearchTokens([token, ...updatedTokens]);
      window.open(tokenUrl, "_blank");
    },
    [tokenUrl],
  );

  const width = useWindowSizeStore((state) => state.width);
  const isMobile = width ? width < 768 : false;
  const isXsUp = width ? width > 375 : false;

  const getPriceChangeClass = (priceChange: string) => {
    const numberOfPriceChange = parseFloat(priceChange);
    if (numberOfPriceChange > 0) return "text-success";
    if (numberOfPriceChange < 0) return "text-destructive";
    if (numberOfPriceChange === 0) return "text-warning";
  };

  const getPriceChangeIcon = (priceChange: string) => {
    const numberOfPriceChange = parseFloat(priceChange);
    if (numberOfPriceChange > 0)
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          id="Bold"
          viewBox="0 0 24 24"
          width="512"
          height="512"
          fill="#8CD9B6"
          className="h-4 w-4"
        >
          <path d="M6.414,15.586H17.586a1,1,0,0,0,.707-1.707L12.707,8.293a1,1,0,0,0-1.414,0L5.707,13.879A1,1,0,0,0,6.414,15.586Z" />
        </svg>
      );

    if (numberOfPriceChange < 0)
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          id="Outline"
          viewBox="0 0 24 24"
          width="512"
          height="512"
          fill="#F65B93"
          className="h-4 w-4"
        >
          <path d="M6.41,9H17.59a1,1,0,0,1,.7,1.71l-5.58,5.58a1,1,0,0,1-1.42,0L5.71,10.71A1,1,0,0,1,6.41,9Z" />
        </svg>
      );

    if (numberOfPriceChange === 0) return;
  };

  return (
    <>
      {isMobile ? (
        <div
          ref={ref}
          onContextMenu={handleCardContextMenu}
          tabIndex={0}
          onClick={handleClick}
          className="flex h-auto w-full cursor-pointer flex-col items-center overflow-hidden rounded-[8px] border border-border bg-[#080812] no-underline duration-300 focus:outline-none"
        >
          <div className="flex w-full items-center justify-between px-3 py-2">
            <div className="flex items-center gap-x-2">
              <div className="-ml-2 sm:ml-0">
                <AvatarWithBadges
                  src={image || ""}
                  alt="Token Image"
                  rightType={
                    dex
                      ?.replace(/\./g, "")
                      ?.replace(/ /g, "_")
                      ?.toLowerCase() as BadgeType
                  }
                  handleGoogleLensSearch={
                    image ? (e) => handleGoogleLensSearch(e, image) : undefined
                  }
                  size="lg"
                  rightClassName="!size-3.5 right-1 bottom-[3px]"
                  className="size-9 sm:size-12"
                />
              </div>

              <div className="flex w-full min-w-[60px] flex-col gap-y-0.5">
                <div className="flex flex-col gap-x-1 md:flex-row md:items-center">
                  <h4 className="line-clamp-1 block text-nowrap font-geistSemiBold text-sm text-fontColorPrimary sm:hidden">
                    {truncateString(symbol || "", 5)}
                  </h4>
                  <h4 className="line-clamp-1 hidden text-nowrap font-geistSemiBold text-sm text-fontColorPrimary sm:block">
                    {symbol}
                  </h4>
                  <div className="flex">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="line-clamp-1 text-nowrap font-geistSemiBold text-xs text-fontColorSecondary">
                            {truncateString(name || "", 5)}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="z-[999]">
                          <p className="font-geistSemiBold">{name}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <Copy
                      value={mint}
                      dataDetail={{
                        mint,
                        name,
                        symbol,
                        image,
                      }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-x-1">
                  <span className="inline-block text-nowrap font-geistSemiBold text-xs text-success">
                    {formatTimeAgo(createdAt)}
                  </span>
                </div>
              </div>
            </div>

            <div
              className={`flex ${isXsUp ? "min-w-[80px]" : "min-w-[70px]"} flex-col gap-y-1 sm:ml-3`}
            >
              <div className="flex items-start">
                <span className="block w-[28px] text-nowrap font-geistSemiBold text-xs text-fontColorSecondary">
                  VOL
                </span>
                <span className="inline-block text-nowrap font-geistSemiBold text-xs text-fontColorPrimary">
                  {volume}
                </span>
              </div>
              <div className="flex items-start">
                <span className="block w-[28px] text-nowrap font-geistSemiBold text-xs text-fontColorSecondary">
                  LIQ
                </span>
                <span className="inline-block text-nowrap font-geistSemiBold text-xs text-fontColorPrimary">
                  {liquidity}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-y-1">
              <div className="flex items-center gap-x-2">
                <div className="text-nowrap font-geistSemiBold text-xs text-fontColorPrimary">
                  {marketCap}
                </div>
                <div
                  className={`flex items-center ${getPriceChangeClass(priceChange)}`}
                >
                  <span className="inline-block text-nowrap font-geistSemiBold text-xs">
                    {Math.abs(parseFloat(priceChange))
                      .toFixed(2)
                      .replace(/\.?0+$/, "")}
                    %
                  </span>
                  {getPriceChangeIcon(priceChange)}
                </div>
              </div>
              <span className="inline-block text-nowrap font-geistSemiBold text-xs text-fontColorSecondary">
                24H MC
              </span>
            </div>
          </div>

          <span className="h-[1px] w-full bg-border"></span>
        </div>
      ) : (
        <div
          ref={ref}
          onContextMenu={handleCardContextMenu}
          tabIndex={0}
          onClick={handleClick}
          className={cn(
            "flex h-[72px] w-full cursor-pointer items-center justify-between overflow-hidden rounded-[8px] border p-4 no-underline duration-300 focus:border-[#DF74FF] focus:outline-none",
            isFocused
              ? "border-[#DF74FF] bg-white/[4%]"
              : "border-border bg-[#080812] hover:border-[#DF74FF]/80 hover:bg-white/[4%]",
          )}
        >
          <div className="flex items-center gap-x-2">
            <AvatarWithBadges
              src={image || ""}
              alt="Token Image"
              rightType={
                dex
                  ?.replace(/\./g, "")
                  ?.replace(/ /g, "_")
                  ?.toLowerCase() as BadgeType
              }
              handleGoogleLensSearch={
                image ? (e) => handleGoogleLensSearch(e, image) : undefined
              }
              size="lg"
              rightClassName="size-4"
              className="size-10"
              classNameParent="!size-10"
            />

            <div className="flex w-full flex-col items-start gap-y-0.5">
              <div className="flex items-center gap-x-1">
                <h4 className="line-clamp-1 block text-nowrap font-geistSemiBold text-sm text-fontColorPrimary sm:hidden">
                  {truncateString(symbol || "", 5)}
                </h4>
                <h4 className="line-clamp-1 hidden text-nowrap font-geistSemiBold text-sm text-fontColorPrimary sm:block">
                  {symbol}
                </h4>
                <div className="hidden min-[430px]:block">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="line-clamp-1 text-nowrap font-geistSemiBold text-xs text-fontColorSecondary">
                          {truncateString(name || "", 5)}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="z-[999]">
                        <p className="font-geistSemiBold">{name}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div>
                  <Copy
                    value={mint}
                    dataDetail={{
                      mint,
                      name,
                      symbol,
                      image,
                    }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-x-1">
                <span className="inline-block text-nowrap font-geistSemiBold text-xs text-success">
                  {formatTimeAgo(createdAt)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex min-w-[80px] flex-col gap-y-1">
            <div className="flex items-center">
              <span className="block w-[28px] text-nowrap font-geistSemiBold text-xs text-fontColorSecondary">
                VOL
              </span>
              <span className="inline-block text-nowrap font-geistSemiBold text-xs text-fontColorPrimary">
                {volume}
              </span>
            </div>
            <div className="flex items-center">
              <span className="block w-[28px] text-nowrap font-geistSemiBold text-xs text-fontColorSecondary">
                LIQ
              </span>
              <span className="inline-block text-nowrap font-geistSemiBold text-xs text-fontColorPrimary">
                {liquidity}
              </span>
            </div>
          </div>

          <div className="flex min-w-[72px] flex-col items-end gap-y-1 sm:min-w-[100px]">
            <div className="flex items-center gap-x-1">
              <span className="inline-block text-nowrap font-geistSemiBold text-xs text-fontColorPrimary">
                {marketCap}
              </span>
              <div
                className={`flex items-center ${getPriceChangeClass(priceChange)}`}
              >
                <span className="inline-block text-nowrap font-geistSemiBold text-xs">
                  {/* {formatAmountWithMaxTwoDigits(priceChange)}% */}
                  {Math.abs(parseFloat(priceChange))
                    .toFixed(2)
                    .replace(/\.?0+$/, "")}
                  %
                </span>
                {getPriceChangeIcon(priceChange)}
              </div>
            </div>
            <span className="inline-block text-nowrap font-geistSemiBold text-xs text-fontColorSecondary">
              24H MC
            </span>
          </div>
        </div>
      )}
    </>
  );
});

export default GlobalSearchResultCard;
