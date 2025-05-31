"use client";

import { type ProfitableToken } from "@/apis/rest/wallet-trade";
import Separator from "@/components/customs/Separator";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/libraries/utils";
import { usePopupStore } from "@/stores/use-popup-state";
import {
  formatAmountDollar,
  formatAmountWithoutLeadingZero,
} from "@/utils/formatAmount";
import { truncateString } from "@/utils/truncateString";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import AvatarWithBadges from "../../AvatarWithBadges";
import { CachedImage } from "../../CachedImage";
import Copy from "../../Copy";
import PnLContent from "../../token/PnL/PnLContent";
import { DialogTitle } from "@radix-ui/react-dialog";
import PnLScreenshot from "../../token/PnL/PnLScreenshot";

interface MostProfitableCardProps {
  isModalContent?: boolean;
  data: ProfitableToken;
}

export default function MostProfitableCard({
  isModalContent = true,
  data,
}: MostProfitableCardProps) {
  const { remainingScreenWidth } = usePopupStore();
  const [solPrice, setSolPrice] = useState<number>(0);
  const [showPnLContent, setShowPnLContent] = useState(false);

  // Get SOL price from localStorage
  useEffect(() => {
    const storedPrice = localStorage.getItem("current_solana_price");
    if (storedPrice) {
      setSolPrice(parseFloat(storedPrice));
    }
  }, []);

  // Memoize the badge type based on dex and launchpad
  const badgeType = useMemo(() => {
    if (data.launchpad) return "launchlab";
    if (data.dex.toLowerCase().includes("pump")) return "pumpswap";
    if (data.dex.toLowerCase().includes("raydium")) return "raydium";
    if (data.dex.toLowerCase().includes("meteora")) return "meteora_amm";
    if (data.dex.toLowerCase().includes("orca")) return "moonshot";
    return "";
  }, [data.dex, data.launchpad]);

  // Memoize formatted values and calculations
  const formattedValues = useMemo(() => {
    const pnlInSol = solPrice > 0 ? data.pnlUsd / solPrice : 0;
    return {
      boughtUsd: formatAmountDollar(data.boughtUsd),
      soldUsd: formatAmountDollar(data.soldUsd),
      pnlUsd: formatAmountDollar(data.pnlUsd),
      pnlSol: formatAmountWithoutLeadingZero(pnlInSol, 3, 2),
      pnlPercentage: `${data.pnlPercentage}`,
      truncatedName: truncateString(data.name, 10),
    };
  }, [
    data.boughtUsd,
    data.soldUsd,
    data.pnlUsd,
    data.pnlPercentage,
    data.name,
    solPrice,
  ]);

  // Memoize PnL data for the modal
  const pnlData = useMemo(() => {
    const pnlInSol = solPrice > 0 ? data.pnlUsd / solPrice : 0;
    return {
      profitAndLoss: pnlInSol,
      profitAndLossUsdRaw: data.pnlUsd,
      profitAndLossPercentage: data.pnlPercentage,
      sold: data.soldUsd / solPrice,
      soldDRaw: data.soldUsd,
      invested: data.invested / solPrice,
      investedDRaw: data.invested,
      remaining: data.remaining / solPrice,
      remainingDRaw: data.remaining,
    };
  }, [
    data.pnlUsd,
    data.soldUsd,
    data.invested,
    data.remaining,
    data.boughtUsd,
    data.pnlPercentage,
    solPrice,
  ]);

  const handlePnLButtonClick = useCallback(() => {
    setShowPnLContent(true);
  }, []);

  const handleClosePnLContent = useCallback(() => {
    setShowPnLContent(false);
  }, []);

  const MostProfitableCardDesktopContent = () => (
    <>
      <div className="hidden h-full w-full min-w-[220px] items-center md:flex">
        <div className="flex items-center gap-x-2">
          <AvatarWithBadges
            classNameParent={`size-8`}
            symbol={data.symbol}
            src={data.image || undefined}
            alt={`${data.name} Image`}
            rightType={badgeType}
          />
          <div className="flex-col">
            <div className="flex max-w-full gap-2">
              <h1 className="text-nowrap font-geistBold text-xs text-fontColorPrimary">
                {formattedValues.truncatedName}
              </h1>
              <h2 className="line-clamp-1 truncate text-nowrap font-geistLight text-xs text-fontColorSecondary">
                {data.symbol}
              </h2>
            </div>
            <div className="flex gap-x-2 overflow-hidden">
              <p className="font-geistRegular text-xs text-fontColorSecondary">
                {data.address.slice(0, 6)}...
                {data.address.slice(-4)}
              </p>
              <Copy value={data.address} />
            </div>
          </div>
        </div>
      </div>
      <div className="hidden h-full w-full min-w-[95px] items-center md:flex">
        <span className="inline-block text-nowrap font-geistSemiBold text-sm text-success">
          {formattedValues.boughtUsd}
        </span>
      </div>
      <div className="hidden h-full w-full min-w-[95px] items-center md:flex">
        <span className="inline-block text-nowrap font-geistSemiBold text-sm text-destructive">
          {formattedValues.soldUsd}
        </span>
      </div>
      <div className="hidden h-full w-full min-w-[115px] items-center md:flex">
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
              data.pnlUsd >= 0 ? "text-success" : "text-destructive",
            )}
          >
            {formattedValues.pnlSol}
          </span>
        </div>
      </div>
      <div className="hidden h-full w-full min-w-[104px] items-center md:flex">
        <span
          className={cn(
            "inline-block text-nowrap font-geistSemiBold text-sm",
            data.pnlUsd >= 0 ? "text-success" : "text-destructive",
          )}
        >
          {formattedValues.pnlPercentage}
        </span>
      </div>
      <div className="hidden h-full w-full min-w-[140px] items-center md:flex">
        <div className="flex items-center">
          <PnLScreenshot
            title={data.name}
            image={data.image || undefined}
            isWithDialog
            profitAndLoss={pnlData.profitAndLoss}
            profitAndLossPercentage={pnlData.profitAndLossPercentage}
            invested={pnlData.invested}
            sold={pnlData.sold}
            remaining={pnlData.remaining}
            solPrice={solPrice}
            trigger={
              <button
                //onClick={handlePnLButtonClick}
                className={cn(
                  "flex h-[28px] items-center gap-x-1.5 rounded-[4px] px-2 py-1",
                  data.pnlUsd >= 0 ? "bg-success" : "bg-destructive",
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

  const MostProfitableCardMobileContent = () => (
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
            symbol={data.symbol}
            src={data.image || undefined}
            alt={`${data.name} Image`}
            rightType={badgeType}
          />
          <div className="flex-col">
            <div className="flex gap-2">
              <h1 className="text-nowrap font-geistBold text-xs text-fontColorPrimary">
                {formattedValues.truncatedName}
              </h1>
              <h2 className="text-nowrap font-geistLight text-xs text-fontColorSecondary">
                {data.symbol}
              </h2>
            </div>
            <div className="flex gap-x-2 overflow-hidden">
              <p className="font-geistRegular text-xs text-fontColorSecondary">
                {data.address.slice(0, 6)}...
                {data.address.slice(-4)}
              </p>
              <Copy value={data.address} />
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
          <span className="font-geistSemiBold text-sm text-success">
            {formattedValues.boughtUsd}
          </span>
        </div>

        <div className="flex flex-col gap-y-1">
          <span className="text-nowrap text-xs text-fontColorSecondary">
            Sold
          </span>
          <span className="font-geistSemiBold text-sm text-destructive">
            {formattedValues.soldUsd}
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
            <span
              className={cn(
                "font-geistSemiBold text-sm",
                data.pnlUsd >= 0 ? "text-success" : "text-destructive",
              )}
            >
              {formattedValues.pnlSol}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-y-1">
          <span className="text-nowrap text-xs text-fontColorSecondary">
            P&L %
          </span>
          <span
            className={cn(
              "font-geistSemiBold text-sm",
              data.pnlUsd >= 0 ? "text-success" : "text-destructive",
            )}
          >
            {formattedValues.pnlPercentage}
          </span>
        </div>

        <div className="flex items-end">
          <PnLScreenshot
            title={data.name}
            image={data.image || undefined}
            isWithDialog
            profitAndLoss={pnlData.profitAndLoss}
            profitAndLossPercentage={pnlData.profitAndLossPercentage}
            invested={pnlData.invested}
            sold={pnlData.sold}
            remaining={pnlData.remaining}
            solPrice={solPrice}
            trigger={
              <button
                //onClick={handlePnLButtonClick}
                className={cn(
                  "flex h-[28px] items-center gap-x-1.5 rounded-[4px] px-2 py-1",
                  data.pnlUsd >= 0 ? "bg-success" : "bg-destructive",
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
    <>
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
        <MostProfitableCardDesktopContent />
        <MostProfitableCardMobileContent />
      </div>

      <Dialog open={showPnLContent} onOpenChange={setShowPnLContent}>
        <DialogContent className="max-w-[816px] p-0">
          <DialogTitle className="sr-only">PnL Image</DialogTitle>
          <PnLContent
            profitAndLoss={pnlData.profitAndLoss}
            profitAndLossUsdRaw={pnlData.profitAndLossUsdRaw}
            profitAndLossPercentage={pnlData.profitAndLossPercentage}
            sold={pnlData.sold}
            soldDRaw={pnlData.soldDRaw}
            invested={pnlData.invested}
            investedDRaw={pnlData.investedDRaw}
            closeElement={null}
            scrollable={true}
            solPrice={solPrice}
            title={data.name}
            image={data.image || undefined}
            type="token"
            remaining={pnlData.remaining}
            remainingDRaw={pnlData.remainingDRaw}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
