"use client";
import { getWalletStats } from "@/apis/rest/wallet-trade";
import { cn } from "@/libraries/utils";
import { useTradesWalletModalStore } from "@/stores/token/use-trades-wallet-modal.store";
import { usePopupStore } from "@/stores/use-popup-state";
import { useSolPriceMessageStore } from "@/stores/use-solprice-message.store";
import { useWindowSizeStore } from "@/stores/use-window-size.store";
import {
  formatAmountDollarPnL,
  formatAmountWithoutLeadingZero,
} from "@/utils/formatAmount";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import { Skeleton } from "../ui/skeleton";
import BaseButton from "./buttons/BaseButton";
import { CachedImage } from "./CachedImage";
import PnLScreenshot from "./token/PnL/PnLScreenshot";
import EditWalletTrigger from "./wallet-trade/EditWalletTrigger";

const WalletTradesInfo = ({
  isModalContent = true,
}: {
  isModalContent?: boolean;
}) => {
  const width = useWindowSizeStore((state) => state.width);
  const params = useParams<{ "wallet-address": string }>();
  const { remainingScreenWidth } = usePopupStore();
  const solPriceState = useSolPriceMessageStore(
    (state) => state.messages?.price,
  );

  const safeSolPrice = useMemo(() => {
    if (typeof window === "undefined") return 0;
    return parseFloat(localStorage.getItem("current_solana_price") ?? "0");
  }, []);

  const solPrice = solPriceState ?? safeSolPrice;
  const walletAddressState = useTradesWalletModalStore((state) => state.wallet);
  const walletAddress = isModalContent
    ? walletAddressState
    : params["wallet-address"];

  const selectedTimeframe = useTradesWalletModalStore(
    (state) => state.selectedTimeframe,
  );

  const {
    data: walletStatsData,
    refetch,
    isLoading,
    isRefetching,
  } = useQuery({
    queryKey: ["wallet-stats", walletAddress],
    queryFn: async () => {
      const res = await getWalletStats(walletAddress);
      return res;
    },
  });

  const handleRefresh = async (e: React.MouseEvent) => {
    e.stopPropagation();

    await refetch();
  };
  const statsValue = useMemo(() => {
    if (!walletStatsData) {
      return {
        totalSpentSol: 0,
        totalHoldingSol: 0,
        profitAndLoss: 0,
        profitAndLossPercentage: 0,
        totalInvested: 0,
        totalSold: 0,
        remaining: 0,
      };
    }

    let finalWalletData;

    // Switch statement for selectedTimeframe
    switch (selectedTimeframe) {
      case "1y":
        finalWalletData = walletStatsData.data.statsYear1;
        break;
      case "1d":
        finalWalletData = walletStatsData.data.statsDay1;
        break;
      case "1w":
        finalWalletData = walletStatsData.data.statsWeek1;
        break;
      case "30d":
        finalWalletData = walletStatsData.data.statsDay30;
        break;
      default:
        finalWalletData = walletStatsData.data.statsYear1;
    }

    const heldTokenAcquisitionCostUsd = Number(
      finalWalletData.statsUsd.heldTokenAcquisitionCostUsd,
    );
    const soldTokenAcquisitionCostUsd = Number(
      finalWalletData.statsUsd.soldTokenAcquisitionCostUsd,
    );
    const realizedProfitUsd = Number(
      finalWalletData.statsUsd.realizedProfitUsd,
    );
    const realizedProfitUsdPercentage = Number(
      finalWalletData.statsUsd.realizedProfitPercentage,
    );
    // Calculate Total Invested and Total Sold
    const totalInvested =
      heldTokenAcquisitionCostUsd + soldTokenAcquisitionCostUsd;
    const totalSold = soldTokenAcquisitionCostUsd / solPrice;

    // Calculate Profit and Loss
    const profitAndLoss = realizedProfitUsd / solPrice;

    // Calculate Profit and Loss Percentage
    const totalInvestedSol = totalInvested / solPrice;
    const realizedProfitSol = realizedProfitUsd / solPrice;
    // Calculate Remaining
    const remaining = totalInvested - totalSold / solPrice;

    // Calculate Sol Values
    const totalHoldingSol =
      Number(finalWalletData.statsUsd.heldTokenAcquisitionCostUsd) / solPrice;
    const totalSpent = totalInvested; // Total spent is the total investment
    const totalSpentSol = Number(totalSpent) / solPrice;

    const pnlPercentage =
      (Number(profitAndLoss || 0) / Number(totalInvestedSol || 1)) * 100;
    return {
      totalSpentSol: formatAmountWithoutLeadingZero(totalSpentSol),
      totalHoldingSol: formatAmountWithoutLeadingZero(totalHoldingSol),
      profitAndLoss: profitAndLoss,
      profitAndLossPercentage: pnlPercentage,
      totalInvested: totalInvestedSol,
      totalSold: totalSold,
      remaining: remaining,
    };
  }, [walletStatsData, selectedTimeframe]);

  if (width && width >= 768) {
    return (
      <div
        className={cn(
          "flex w-auto max-w-full flex-row items-center gap-x-1 rounded-[8px] border border-border md:mb-0 md:flex-row md:pl-1",
          remainingScreenWidth < 768 && !isModalContent && "md:flex-col",
        )}
      >
        <div
          className={cn(
            "h-[60px] w-full border-r border-border md:h-auto md:w-auto",
            !isModalContent && "xl:w-full",
            remainingScreenWidth < 1280 && !isModalContent && "xl:w-auto",
            remainingScreenWidth < 800 && !isModalContent && "py-3 xl:w-full",
          )}
        >
          <EditWalletTrigger
            isModalContent={isModalContent}
            walletAddress={walletAddress}
          />
        </div>

        <div className="relative flex h-full min-h-[110px] w-full flex-col-reverse items-center gap-1 gap-x-0 p-2 md:min-h-0 md:flex-row md:gap-2 md:p-1">
          {isLoading ? (
            <>
              <div
                className="grid grid-cols-3 gap-2 px-1 py-1 md:w-auto md:grid-flow-col"
                style={{
                  width: "inherit",
                }}
              >
                <div className="relative col-span-1 flex flex-col justify-center gap-1 rounded-[4px] border-r border-border px-2 py-1 max-md:border md:rounded-none md:bg-transparent md:p-0">
                  <span className="relative z-20 inline-block text-xs text-fontColorSecondary">
                    Total Spent
                  </span>
                  <div className="relative z-20 mt-[-0.2rem] flex items-center gap-x-1.5">
                    <Skeleton className="h-[18px] w-[40%]" />
                  </div>
                </div>

                <div className="relative col-span-1 flex flex-col justify-center gap-1 rounded-[4px] border-border px-2 py-1 max-md:border md:rounded-none md:border-r md:bg-transparent md:p-0">
                  <span className="relative z-20 inline-block text-xs text-fontColorSecondary">
                    Total Holding
                  </span>
                  <div className="relative z-20 mt-[-0.2rem] flex items-center gap-x-1.5">
                    <Skeleton className="h-[18px] w-[40%]" />
                  </div>
                </div>

                <div
                  className={cn(
                    "col-span-1 flex items-center justify-between rounded-[4px] p-1 py-1",
                    statsValue.profitAndLossPercentage > 0
                      ? "bg-success/20"
                      : "bg-destructive/20",
                  )}
                >
                  <div className="flex h-full flex-1 items-center">
                    <div
                      className={cn(
                        "h-[32px] w-1 rounded-[10px] bg-success",
                        statsValue.profitAndLossPercentage > 0
                          ? "bg-success"
                          : "bg-destructive",
                      )}
                    ></div>
                    <div className="flex h-full w-full flex-col pl-2">
                      <span className="relative z-20 inline-block text-xs text-fontColorSecondary">
                        Total P&L
                      </span>
                      <div className="flex w-full items-center justify-between">
                        <div className="flex items-center gap-x-1">
                          <Skeleton className="h-[18px] w-[80px]" />
                        </div>

                        <BaseButton
                          onClick={handleRefresh}
                          variant="gray"
                          size="short"
                          className="size-[18px] bg-transparent"
                        >
                          <div className="relative z-30 aspect-square size-[18px] flex-shrink-0">
                            <Image
                              src="/icons/refresh.png"
                              alt="Refresh Icon"
                              fill
                              quality={100}
                              className={cn(
                                "object-contain",
                                isRefetching || (isLoading && "animate-spin"),
                              )}
                            />
                          </div>
                        </BaseButton>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div
                className="grid grid-cols-3 gap-2 px-1 py-1 md:w-auto md:grid-flow-col"
                style={{
                  width: "inherit",
                }}
              >
                <div className="relative col-span-1 flex flex-col justify-center gap-1 rounded-[4px] border-r border-border px-2 py-1 max-md:border md:rounded-none md:bg-transparent md:p-0">
                  <span className="relative z-20 inline-block text-xs text-fontColorSecondary">
                    Total Spent
                  </span>
                  <div className="relative z-20 mt-[-0.2rem] flex items-center gap-x-1.5">
                    <div className="relative aspect-square h-4 w-4 flex-shrink-0">
                      <CachedImage
                        src="/icons/solana-sq.svg"
                        alt="Solana SQ Icon"
                        fill
                        quality={100}
                        className="object-contain"
                      />
                    </div>
                    <span className="inline-block text-nowrap font-geistSemiBold text-sm text-fontColorPrimary">
                      {statsValue.totalSpentSol}
                    </span>
                  </div>
                </div>

                <div className="relative col-span-1 flex flex-col justify-center gap-1 rounded-[4px] border-border px-2 py-1 max-md:border md:rounded-none md:border-r md:bg-transparent md:p-0">
                  <span className="relative z-20 inline-block text-xs text-fontColorSecondary">
                    Total Holding
                  </span>
                  <div className="relative z-20 mt-[-0.2rem] flex items-center gap-x-1.5">
                    <div className="relative aspect-square h-4 w-4 flex-shrink-0">
                      <CachedImage
                        src="/icons/solana-sq.svg"
                        alt="Solana SQ Icon"
                        fill
                        quality={100}
                        className="object-contain"
                      />
                    </div>
                    <span className="inline-block text-nowrap font-geistSemiBold text-sm text-fontColorPrimary">
                      {statsValue.totalHoldingSol}
                    </span>
                  </div>
                </div>

                <div
                  className={cn(
                    "col-span-1 flex items-center justify-between rounded-[4px] p-1 py-1",
                    statsValue.profitAndLossPercentage > 0
                      ? "bg-success/20"
                      : "bg-destructive/20",
                  )}
                >
                  <PnLScreenshot
                    title="NOVA"
                    isWithDialog
                    profitAndLoss={statsValue.profitAndLoss}
                    profitAndLossPercentage={statsValue.profitAndLossPercentage}
                    invested={statsValue.totalInvested}
                    sold={statsValue.totalSold}
                    remaining={statsValue.remaining}
                    handleReload={handleRefresh}
                    isLoading={isLoading}
                    solPrice={solPrice}
                    image="/images/pnl-tracker/nova-badge.png"
                    trigger={
                      <div className="flex h-full flex-1 items-center">
                        <div
                          className={cn(
                            "h-[32px] w-1 rounded-[10px] bg-success",
                            statsValue.profitAndLossPercentage > 0
                              ? "bg-success"
                              : "bg-destructive",
                          )}
                        ></div>
                        <div className="flex h-full w-full flex-col pl-2">
                          <span className="relative z-20 inline-block text-xs text-fontColorSecondary">
                            Total P&L
                          </span>
                          <div className="flex w-full items-center justify-between">
                            <div className="flex items-center gap-x-1">
                              <span className="inline-block text-nowrap font-geistSemiBold text-sm text-fontColorPrimary">
                                {formatAmountDollarPnL(
                                  statsValue.profitAndLoss * solPrice,
                                )}
                              </span>
                              <span
                                className={cn(
                                  "rounded-full bg-success/10 px-2 py-0.5 text-xs",
                                  statsValue.profitAndLossPercentage > 0
                                    ? "text-success"
                                    : "text-destructive",
                                )}
                              >
                                {Number(
                                  statsValue.profitAndLossPercentage,
                                ).toFixed(2)}
                                %
                              </span>
                            </div>

                            <BaseButton
                              onClick={handleRefresh}
                              variant="gray"
                              size="short"
                              className="size-[18px] bg-transparent"
                            >
                              <div className="relative z-30 aspect-square size-[18px] flex-shrink-0">
                                <Image
                                  src="/icons/refresh.png"
                                  alt="Refresh Icon"
                                  fill
                                  quality={100}
                                  className={cn(
                                    "object-contain",
                                    isRefetching ||
                                      (isLoading && "animate-spin"),
                                  )}
                                />
                              </div>
                            </BaseButton>
                          </div>
                        </div>
                      </div>
                    }
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }
  return (
    <div className="flex w-auto max-w-full flex-col items-center gap-x-1 rounded-[8px] border border-border bg-white/[4%]">
      <EditWalletTrigger
        isModalContent={isModalContent}
        walletAddress={walletAddress}
      />

      <div className="relative flex h-full min-h-[110px] w-full flex-col items-center gap-2 p-3">
        {isLoading ? (
          <div className="absolute left-1/2 top-1/2 aspect-square size-5 flex-shrink-0 -translate-x-1/2 -translate-y-1/2 transform-gpu">
            <Image
              src="/icons/search-loading.png"
              alt="Loading Icon"
              fill
              quality={100}
              className="animate-spin object-contain"
            />
          </div>
        ) : (
          <>
            <PnLScreenshot
              title="NOVA"
              isWithDialog
              profitAndLoss={statsValue.profitAndLoss}
              profitAndLossPercentage={statsValue.profitAndLossPercentage}
              invested={statsValue.totalInvested}
              sold={statsValue.totalSold}
              remaining={statsValue.remaining}
              handleReload={handleRefresh}
              isLoading={isLoading}
              solPrice={solPrice}
              image="/images/pnl-tracker/nova-badge.png"
              trigger={
                <div
                  className={cn(
                    "relative mx-auto flex h-[46px] w-full items-center justify-between gap-x-2 rounded-[4px] p-1 pr-2",
                    statsValue.profitAndLossPercentage > 0
                      ? "bg-success/20"
                      : "bg-destructive/20",
                  )}
                >
                  <div
                    className={cn(
                      "absolute left-[4px] top-[4px] h-[38px] w-1 rounded",
                      statsValue.profitAndLossPercentage > 0
                        ? "bg-success"
                        : "bg-destructive",
                    )}
                  />
                  <div className="flex h-full flex-col pl-3">
                    <span className="inline-block font-geistRegular text-xs text-fontColorSecondary">
                      Total P&L
                    </span>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-x-1">
                        <span className="inline-block text-nowrap font-geistSemiBold text-sm text-fontColorPrimary">
                          {statsValue.profitAndLossPercentage < 0 ? "" : "+"}
                          {Number(statsValue.profitAndLossPercentage).toFixed(
                            2,
                          )}
                          %
                        </span>
                        <span
                          className={cn(
                            "font-geistSemiBold text-sm",
                            statsValue.profitAndLossPercentage > 0
                              ? "text-success"
                              : "text-destructive",
                          )}
                        >
                          ({statsValue.profitAndLoss < 0 ? "" : "+"}
                          {formatAmountDollarPnL(
                            statsValue.profitAndLoss * solPrice,
                          )}
                          )
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    title="Refresh Trigger"
                    onClick={handleRefresh}
                    className="inline-flex size-[32px] items-center justify-center rounded-[8px] bg-[#17171F] p-2"
                  >
                    <div className="relative aspect-square size-5">
                      <Image
                        src="/icons/refresh.png"
                        alt="Refresh Icon"
                        fill
                        quality={100}
                        className={cn(
                          "object-contain",
                          isRefetching || (isLoading && "animate-spin"),
                        )}
                      />
                    </div>
                  </button>
                </div>
              }
            />
            {/* Change in P&L */}

            {/* Total Holding & Spent */}
            <div className="flex w-full gap-2">
              <div className="relative flex w-full flex-col justify-center gap-0.5 rounded-[4px] border border-border bg-white/[4%] px-2 py-1">
                <span className="relative z-20 inline-block text-xs text-fontColorSecondary">
                  Total Spent
                </span>
                <div className="relative z-20 flex items-center gap-x-1.5">
                  <div className="relative aspect-square h-4 w-4 flex-shrink-0">
                    <CachedImage
                      src="/icons/solana-sq.svg"
                      alt="Solana SQ Icon"
                      fill
                      quality={100}
                      className="object-contain"
                    />
                  </div>
                  <span className="inline-block text-nowrap font-geistSemiBold text-sm text-fontColorPrimary">
                    {statsValue.totalSpentSol}
                  </span>
                </div>
              </div>

              <div className="relative col-span-1 flex w-full flex-col justify-center gap-0.5 rounded-[4px] border border-border bg-white/[4%] px-2 py-1">
                <span className="relative z-20 inline-block text-xs text-fontColorSecondary">
                  Total Holding
                </span>
                <div className="relative z-20 flex items-center gap-x-1.5">
                  <div className="relative aspect-square h-4 w-4 flex-shrink-0">
                    <CachedImage
                      src="/icons/solana-sq.svg"
                      alt="Solana SQ Icon"
                      fill
                      quality={100}
                      className="object-contain"
                    />
                  </div>
                  <span className="inline-block text-nowrap font-geistSemiBold text-sm text-fontColorPrimary">
                    {statsValue.totalHoldingSol}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default WalletTradesInfo;
