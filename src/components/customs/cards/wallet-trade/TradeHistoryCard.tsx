"use client";

import { type TradeHistoryItem } from "@/apis/rest/wallet-trade";
import { cn } from "@/libraries/utils";
import { usePopupStore } from "@/stores/use-popup-state";
import { truncateAddress } from "@/utils/truncateAddress";
import { truncateString } from "@/utils/truncateString";
import { useMemo } from "react";
import AddressWithEmojis from "../../AddressWithEmojis";
import AvatarWithBadges from "../../AvatarWithBadges";
import { CachedImage } from "../../CachedImage";
import CircleCount from "../../CircleCount";
import Copy from "../../Copy";
import SellBuyBadge from "../../SellBuyBadge";

type TradeHistoryCardProps = {
  isModalContent?: boolean;
  data: TradeHistoryItem;
  tradesValue: string;
  totalValue: string;
  formatValue: (value: number) => string;
  formatTotal: (value: number) => string;
  walletAddress: string;
};

export default function TradeHistoryCard({
  isModalContent = true,
  data,
  tradesValue,
  totalValue,
  walletAddress,
  formatValue,
  formatTotal,
}: TradeHistoryCardProps) {
  const { remainingScreenWidth } = usePopupStore();

  // Calculate time ago
  const timeAgo = useMemo(() => {
    const now = Math.floor(Date.now() / 1000);
    const diff = now - data.timestamp;

    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
  }, [data.timestamp]);

  // Get token amount and format it
  const formattedTokenAmount = useMemo(() => {
    return data.amount;
  }, [data.amount]);

  // Memoize the badge type based on dex and launchpad
  const badgeType = useMemo(() => {
    if (data.launchpad) return "launchlab";
    if (data.dex.toLowerCase().includes("pump")) return "pumpswap";
    if (data.dex.toLowerCase().includes("raydium")) return "raydium";
    if (data.dex.toLowerCase().includes("meteora")) return "meteora_amm";
    if (data.dex.toLowerCase().includes("orca")) return "moonshot";
    return "";
  }, [data.dex, data.launchpad]);

  // Memoize the truncated pair name
  const truncatedPairName = useMemo(() => {
    return truncateString(data.pairName, 10); // Adjust maxLength as needed
  }, [data.pairName]);

  const TradeHistoryCardDesktopContent = () => (
    <>
      <div
        className={cn(
          "hidden h-full w-auto min-w-[72px] items-center md:flex",
          !isModalContent && "lg:min-w-[164px]",
          remainingScreenWidth < 1280 && !isModalContent && "lg:min-w-[72px]",
        )}
      >
        <span className="inline-block text-nowrap font-geistSemiBold text-sm text-fontColorPrimary">
          {timeAgo}
        </span>
      </div>
      <div
        className={cn(
          "hidden h-full w-full min-w-[240px] items-center md:flex",
          !isModalContent && "min-w-[200px]",
        )}
      >
        <div className="flex items-center gap-x-2">
          <SellBuyBadge type={data.direction} size="sm" />
          <AvatarWithBadges
            classNameParent={`size-8`}
            symbol={data.pairSymbol}
            src={data.pairImage || undefined}
            alt={`${data.pairName} Image`}
            rightType={badgeType}
          />
          <div className="flex-col">
            <div className="flex gap-2">
              <h1 className="text-nowrap font-geistBold text-xs text-fontColorPrimary">
                {truncatedPairName}
              </h1>
              <h2 className="text-nowrap font-geistLight text-xs text-fontColorSecondary">
                {data.pairSymbol}
              </h2>
            </div>
            <div className="scrollbar scrollbar-w-[5px] scrollbar-track-[#1a1b1e]/40 scrollbar-thumb-[#4a4b50] hover:scrollbar-thumb-[#5a5b60] active:scrollbar-thumb-[#6a6b70] flex gap-x-2 overflow-x-auto rounded-[10px]">
              <p className="font-geistRegular text-xs text-fontColorSecondary">
                {data.pairAddress
                  ? `${data.pairAddress.slice(0, 8)}...${data.pairAddress.slice(-4)}`
                  : "N/A"}
              </p>
              {data.pairAddress && <Copy value={data.pairAddress} />}
            </div>
          </div>
        </div>
      </div>
      <div className="hidden h-full w-full min-w-[115px] items-center md:flex lg:min-w-[125px]">
        <div className="flex items-center gap-x-[4px]">
          <div className="relative aspect-auto h-[16px] w-[16px] flex-shrink-0">
            <CachedImage
              src={
                tradesValue === "SOL"
                  ? "/icons/solana-sq.svg"
                  : "/icons/usdc-colored.svg"
              }
              alt={`${tradesValue} Icon`}
              fill
              quality={50}
              className="object-contain"
            />
          </div>
          <span className="inline-block text-nowrap font-geistSemiBold text-sm text-success">
            {formatValue(data.usd)}
          </span>
        </div>
      </div>
      <div
        className={cn(
          "hidden h-full w-full min-w-[80px] items-center md:flex lg:min-w-[155px]",
          remainingScreenWidth < 1280 && "lg:min-w-[80px]",
        )}
      >
        <span className="inline-block text-nowrap font-geistSemiBold text-sm text-success">
          {formattedTokenAmount}
        </span>
      </div>
      <div className="hidden h-full w-full min-w-[125px] items-center md:flex lg:min-w-[175px]">
        <div className="flex items-center gap-x-[4px]">
          <div className="relative aspect-auto h-[16px] w-[16px] flex-shrink-0">
            <CachedImage
              src={
                totalValue === "SOL"
                  ? "/icons/solana-sq.svg"
                  : "/icons/usdc-colored.svg"
              }
              alt={`${totalValue} Icon`}
              fill
              quality={50}
              className="object-contain"
            />
          </div>
          <span className="inline-block text-nowrap font-geistSemiBold text-sm text-success">
            {formatTotal(data.usd)}
          </span>
        </div>
      </div>
    </>
  );

  const TradeHistoryCardMobileContent = () => (
    <div
      className={cn(
        "flex w-full flex-col md:hidden",
        remainingScreenWidth < 700 && !isModalContent && "md:flex",
      )}
    >
      {/* Header */}
      <div className="relative flex h-12 w-full items-center justify-between overflow-hidden bg-white/[4%] px-3 py-3">
        <div className="flex items-center gap-x-3">
          <SellBuyBadge isExpanded type={data.direction} size="sm" />
          <div className="flex items-center gap-x-2">
            <AvatarWithBadges
              classNameParent={`size-8`}
              symbol={data.pairSymbol}
              src={data.pairImage || undefined}
              alt={`${data.pairName} Image`}
              rightType={badgeType}
            />
            <div className="flex-col">
              <div className="flex gap-2">
                <h1 className="text-nowrap font-geistBold text-xs text-fontColorPrimary">
                  {truncatedPairName}
                </h1>
                <h2 className="text-nowrap font-geistLight text-xs text-fontColorSecondary">
                  {data.pairSymbol}
                </h2>
              </div>
              <div className="scrollbar scrollbar-w-[5px] scrollbar-track-[#1a1b1e]/40 scrollbar-thumb-[#4a4b50] hover:scrollbar-thumb-[#5a5b60] active:scrollbar-thumb-[#6a6b70] flex gap-x-2 overflow-x-auto rounded-[10px]">
                <p className="font-geistRegular text-xs text-fontColorSecondary">
                  {data.pairAddress ? truncateAddress(data.pairAddress) : "N/A"}
                </p>
                {data.pairAddress && <Copy value={data.pairAddress} />}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-x-2">
          <span className="text-xs text-fontColorSecondary">
            {timeAgo}
            <span className="ml-1 font-geistSemiBold text-fontColorPrimary">
              Age
            </span>
          </span>
        </div>
      </div>

      {/* Market Data Grid */}
      <div className="flex justify-around gap-2.5 p-3">
        <div className="flex flex-col gap-y-1">
          <span className="text-nowrap text-xs text-fontColorSecondary">
            Value
          </span>
          <div className="flex items-center gap-x-1">
            <div className="relative aspect-auto h-[16px] w-[16px]">
              <CachedImage
                src={
                  tradesValue === "SOL"
                    ? "/icons/solana-sq.svg"
                    : "/icons/usdc-colored.svg"
                }
                alt={`${tradesValue} Icon`}
                fill
                quality={50}
                className="object-contain"
              />
            </div>
            <span className="font-geistSemiBold text-sm text-success">
              {formatValue(data.usd)}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-y-1">
          <span className="text-nowrap text-xs text-fontColorSecondary">
            Amount
          </span>
          <span className="font-geistSemiBold text-sm text-success">
            {formattedTokenAmount}
          </span>
        </div>

        <div className="flex flex-col gap-y-1">
          <span className="text-nowrap text-xs text-fontColorSecondary">
            Total
          </span>
          <div className="flex items-center gap-x-1">
            <div className="relative aspect-auto h-[16px] w-[16px]">
              <CachedImage
                src={
                  totalValue === "SOL"
                    ? "/icons/solana-sq.svg"
                    : "/icons/usdc-colored.svg"
                }
                alt={`${totalValue} Icon`}
                fill
                quality={50}
                className="object-contain"
              />
            </div>
            <span className="font-geistSemiBold text-sm text-success">
              {formatTotal(data.usd)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-x-1 border-t border-border p-3">
        <AddressWithEmojis
          color="success"
          address={walletAddress ? truncateAddress(walletAddress) : "N/A"}
          emojis={["whale.png", "dolphin.png"]}
        />
        <CircleCount value={1} />
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
        "scrollbar scrollbar-w-[5px] scrollbar-track-[#1a1b1e]/40 scrollbar-thumb-[#4a4b50] hover:scrollbar-thumb-[#5a5b60] active:scrollbar-thumb-[#6a6b70] rounded-[10px]",
      )}
    >
      {remainingScreenWidth < 700 && !isModalContent ? null : (
        <TradeHistoryCardDesktopContent />
      )}
      <TradeHistoryCardMobileContent />
    </div>
  );
}
