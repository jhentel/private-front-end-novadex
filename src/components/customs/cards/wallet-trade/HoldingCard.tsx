"use client";

import { TransformedHoldingData } from "@/components/customs/tables/wallet-trade/HoldingTable";
import { cn } from "@/libraries/utils";
import { usePopupStore } from "@/stores/use-popup-state";
import { formatNumber } from "@/utils/formatNumber";
import { truncateString } from "@/utils/truncateString";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import AvatarWithBadges, { BadgeType } from "../../AvatarWithBadges";
import Copy from "../../Copy";
import Separator from "../../Separator";
import PnLScreenshot from "../../token/PnL/PnLScreenshot";

interface HoldingCardProps {
  isModalContent?: boolean;
  data: TransformedHoldingData;
  solPrice: number;
}

export default function HoldingCard({
  isModalContent = true,
  data,
  solPrice,
}: HoldingCardProps) {
  const { remainingScreenWidth } = usePopupStore();
  const [amountOrRecent, setAmountOrRecent] = useState<"Amount" | "Recent">(
    "Amount",
  );
  const params = useParams();

  // Calculate P&L
  const pl = useCallback(() => {
    if (!data?.investedUsd) return 0;
    const plValue =
      ((Number(data.soldUsd) - Number(data.investedUsd)) /
        Number(data.investedUsd)) *
      100;
    return isNaN(plValue) ? 0 : plValue;
  }, [data]);

  // Memoize truncated token name
  const truncatedTokenName = useMemo(() => {
    return truncateString(data?.token?.name || "Unknown Token", 10);
  }, [data?.token?.name]);

  const badgeType = useMemo(() => {
    if (data.token.launchpad) return "launchlab";
    if (data.token.origin_dex.toLowerCase().includes("pump")) return "pumpswap";
    if (data.token.origin_dex.toLowerCase().includes("raydium"))
      return "raydium";
    if (data.token.origin_dex.toLowerCase().includes("meteora"))
      return "meteora_amm";
    if (data.token.origin_dex.toLowerCase().includes("orca")) return "moonshot";
    return "";
  }, [data.token.origin_dex, data.token.launchpad]);

  const HoldingCardDesktopContent = () => (
    <>
      <div className="hidden h-full w-full min-w-[220px] items-center md:flex">
        <div className="flex items-center gap-x-2">
          <AvatarWithBadges
            classNameParent={`size-8`}
            symbol={data?.token?.symbol || ""}
            src={data?.token?.image || ""}
            alt={`${data?.token?.name || "Token"} Image`}
            rightType={
              data.token?.origin_dex === "LaunchLab" &&
              data.token?.launchpad === "Bonk"
                ? "bonk"
                : data.token?.origin_dex === "Dynamic Bonding Curve" &&
                    data.token?.launchpad === "Launch a Coin"
                  ? "launch_a_coin"
                  : badgeType
            }
          />
          <div className="flex-col">
            <div className="flex gap-2">
              <h1 className="text-nowrap font-geistBold text-xs text-fontColorPrimary">
                {truncatedTokenName}
              </h1>
              <h2 className="text-nowrap font-geistLight text-xs text-fontColorSecondary">
                {data?.token?.symbol || ""}
              </h2>
            </div>
            <div className="flex gap-x-2 overflow-hidden">
              <p className="font-geistRegular text-xs text-fontColorSecondary">
                {data?.token?.mint
                  ? `${data.token.mint.slice(0, 6)}...${data.token.mint.slice(-4)}`
                  : "Unknown Address"}
              </p>
              {data?.token?.mint && <Copy value={data.token.mint} />}
            </div>
          </div>
        </div>
      </div>

      {/* Bought */}
      <div className="hidden h-full w-full min-w-[80px] items-center md:flex">
        <span className="inline-block text-nowrap font-geistSemiBold text-sm text-success">
          ${formatNumber(Number(data?.investedUsd || 0))}
        </span>
      </div>

      {/* Sold */}
      <div className="hidden h-full w-full min-w-[80px] items-center md:flex">
        <span className="inline-block text-nowrap font-geistSemiBold text-sm text-destructive">
          ${formatNumber(Number(data?.soldUsd || 0))}
        </span>
      </div>

      {/* Remaining */}
      <div className="hidden h-full w-full min-w-[120px] items-center md:flex">
        <span className="inline-block text-nowrap font-geistSemiBold text-sm text-fontColorPrimary">
          ${formatNumber(Number(data?.remaining * solPrice || 0))}
        </span>
      </div>

      {/* PnL */}
      <div className="hidden h-full w-full min-w-[90px] items-center md:flex">
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
          <span
            className={cn(
              "inline-block text-nowrap font-geistSemiBold text-sm",
              data.pnl >= 0 ? "text-success" : "text-destructive",
            )}
          >
            {data.pnlPercentage ?? "+0.0%"}
          </span>
        </div>
      </div>

      {/* Share PnL */}
      <div className="hidden h-full w-full min-w-[140px] items-center md:flex">
        <div className="flex items-center">
          <PnLScreenshot
            title={data.token.symbol}
            image={data.token.image ?? "/images/pnl-tracker/nova-badge.png"}
            isWithDialog
            profitAndLoss={data.pnl}
            profitAndLossPercentage={data.pnlPercentage}
            invested={data.investedSol}
            sold={data.soldSol}
            remaining={data.remaining}
            solPrice={solPrice}
            trigger={
              <button
                className={cn(
                  "flex h-[28px] items-center gap-x-1.5 rounded-[4px] px-2 py-1",
                  data.pnl >= 0 ? "bg-success" : "bg-destructive",
                )}
              >
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
            }
          />
        </div>
      </div>
    </>
  );

  const HoldingCardMobileContent = () => (
    <div
      className={cn(
        "flex w-full flex-col md:hidden",
        remainingScreenWidth < 700 && !isModalContent && "md:flex",
      )}
    >
      {/* Header */}
      <div className="relative flex h-12 w-full items-center justify-between overflow-hidden bg-white/[4%] px-3 py-3">
        <div className="flex items-center gap-x-2">
          <AvatarWithBadges
            classNameParent={`size-8`}
            symbol={data?.token?.symbol || ""}
            src={data?.token?.image || ""}
            alt={`${data?.token?.name || "Token"} Image`}
            rightType="moonshot"
          />
          <div className="flex-col">
            <div className="flex gap-2">
              <h1 className="text-nowrap font-geistBold text-xs text-fontColorPrimary">
                {truncatedTokenName}
              </h1>
              <h2 className="text-nowrap font-geistLight text-xs text-fontColorSecondary">
                {data?.token?.symbol || ""}
              </h2>
            </div>
            <div className="flex gap-x-2 overflow-hidden">
              <p className="font-geistRegular text-xs text-fontColorSecondary">
                {data?.token?.mint
                  ? `${data.token.mint.slice(0, 6)}...${data.token.mint.slice(-4)}`
                  : "Unknown Address"}
              </p>
              {data?.token?.mint && <Copy value={data.token.mint} />}
            </div>
          </div>
        </div>
      </div>

      {/* Market Data Grid */}
      <div className="flex justify-around gap-2.5 p-3">
        <div className="flex flex-col gap-y-1">
          <span className="text-nowrap text-xs text-fontColorSecondary">
            Bought
          </span>
          <span className="font-geistSemiBold text-xs text-success">
            ${formatNumber(Number(data?.investedUsd || 0))}
          </span>
        </div>

        <div className="flex flex-col gap-y-1">
          <span className="text-nowrap text-xs text-fontColorSecondary">
            Sold
          </span>
          <span className="font-geistSemiBold text-xs text-destructive">
            ${formatNumber(Number(data?.soldUsd || 0))}
          </span>
        </div>

        <div className="flex flex-col gap-y-1">
          <span className="text-nowrap text-xs text-fontColorSecondary">
            Remaining
          </span>
          <span className="font-geistSemiBold text-xs text-fontColorPrimary">
            ${formatNumber(Number(data?.remaining * solPrice || 0))}
          </span>
        </div>

        <div className="flex flex-col gap-y-1">
          <span className="text-nowrap text-xs text-fontColorSecondary">
            P&L %
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
            <span
              className={cn(
                "font-geistSemiBold text-xs",
                data.pnl >= 0 ? "text-success" : "text-destructive",
              )}
            >
              {data.pnlPercentage ?? "+0.0%"}
            </span>
          </div>
        </div>

        <div className="col-span-2 flex items-end justify-end">
          <PnLScreenshot
            title={data.token.symbol}
            image={data.token.image ?? "/images/pnl-tracker/nova-badge.png"}
            isWithDialog
            profitAndLoss={data.pnl}
            profitAndLossPercentage={data.pnlPercentage}
            invested={data.investedSol}
            sold={data.soldSol}
            remaining={data.remaining}
            solPrice={solPrice}
            trigger={
              <button
                className={cn(
                  "flex h-[28px] items-center gap-x-1.5 rounded-[4px] px-2 py-1",
                  data.pnl >= 0 ? "bg-success" : "bg-destructive",
                )}
              >
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
            }
          />
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
        <HoldingCardDesktopContent />
      )}
      <HoldingCardMobileContent />
    </div>
  );
}
