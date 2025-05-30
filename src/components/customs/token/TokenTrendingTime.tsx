"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import React, { useMemo } from "react";
import { useTokenMessageStore } from "@/stores/token/use-token-messages.store";
import { useSelectedTrendingTime } from "@/stores/token/use-selected-trending-time.store";
// ######## Components 🧩 ########
import CompareableBarChart from "../charts/CompareableBarChart";
// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";
import { formatAmountDollar } from "@/utils/formatAmount";
import { VolumeInfo } from "@/types/ws-general";
import { usePopupStore } from "@/stores/use-popup-state";

export default React.memo(function TokenTrendingTime({
  initVolumeData,
  loading = false,
}: {
  initVolumeData: VolumeInfo | null;
  loading?: boolean;
}) {
  const isOldToken =
    useTokenMessageStore((state) => state.tokenInfoMessage?.isOld) || false;
  const tokenVolumeData = useTokenMessageStore((state) => state.volumeMessage);
  const selectedTrendingTime = useSelectedTrendingTime(
    (state) => state.selectedTrendingTime,
  );
  const setSelectedTrendingTime = useSelectedTrendingTime(
    (state) => state.setSelectedTrendingTime,
  );

  const finalVolumeData = (
    tokenVolumeData?.volume_1h ? tokenVolumeData : initVolumeData
  ) as VolumeInfo;

  const selectedVolumeBasedOnTime = useMemo(() => {
    const map = {
      volume_5m: finalVolumeData?.volume_5m,
      volume_1h: finalVolumeData?.volume_1h,
      volume_6h: finalVolumeData?.volume_6h,
      volume_24h: finalVolumeData?.volume_24h,
    };

    return selectedTrendingTime === "none"
      ? undefined
      : map[selectedTrendingTime];
  }, [tokenVolumeData, selectedTrendingTime, finalVolumeData]);

  const { remainingScreenWidth } = usePopupStore();

  return (
    <div
      className={cn(
        "flex h-auto w-full flex-col justify-between overflow-hidden rounded-[8px] border border-border",
        remainingScreenWidth <= 768 && "md:hidden",
        loading && "md:flex",
      )}
    >
      <div
        className={cn(
          "grid w-full",
          isOldToken ? "grid-cols-2" : "grid-cols-4",
          selectedTrendingTime !== "none" && "border-b border-border",
        )}
      >
        <button
          onClick={() =>
            setSelectedTrendingTime(
              selectedTrendingTime === "volume_5m" ? "none" : "volume_5m",
            )
          }
          className={cn(
            "col-span-1 flex flex-col items-center border-r border-border py-1.5 duration-300",
            selectedTrendingTime === "volume_5m" && "bg-white/[6%]",
          )}
        >
          <span className="header__table__text font-geistRegular text-xs !text-[#9191A4]">
            5M
          </span>
          <span
            className={cn(
              "-mt-0.5 inline-block text-nowrap font-geistSemiBold text-[13px]",
              finalVolumeData?.["volume_5m"].percentage > 0
                ? "text-success"
                : "text-destructive",
            )}
          >
            {finalVolumeData?.["volume_5m"].percentage > 0 ? "+" : ""}
            {finalVolumeData?.["volume_5m"].percentage > 1000
              ? finalVolumeData?.["volume_5m"].percentage
                  .toFixed(0)
                  .toLocaleString()
              : finalVolumeData?.["volume_5m"].percentage.toFixed(2) || 0}
            %
          </span>
        </button>
        <button
          onClick={() =>
            setSelectedTrendingTime(
              selectedTrendingTime === "volume_1h" ? "none" : "volume_1h",
            )
          }
          className={cn(
            "col-span-1 flex flex-col items-center border-r border-border py-1.5 duration-300",
            selectedTrendingTime === "volume_1h" && "bg-white/[6%]",
          )}
        >
          <span className="header__table__text font-geistRegular text-xs !text-[#9191A4]">
            1H
          </span>
          <span
            className={cn(
              "-mt-0.5 inline-block text-nowrap font-geistSemiBold text-[13px]",
              finalVolumeData?.["volume_1h"].percentage > 0
                ? "text-success"
                : "text-destructive",
            )}
          >
            {finalVolumeData?.["volume_1h"].percentage > 0 ? "+" : ""}
            {finalVolumeData?.["volume_1h"].percentage > 1000
              ? finalVolumeData?.["volume_1h"].percentage
                  .toFixed(0)
                  .toLocaleString()
              : finalVolumeData?.["volume_1h"].percentage.toFixed(2) || 0}
            %
          </span>
        </button>
        {!isOldToken && (
          <>
            <button
              onClick={() =>
                setSelectedTrendingTime(
                  selectedTrendingTime === "volume_6h" ? "none" : "volume_6h",
                )
              }
              className={cn(
                "col-span-1 flex flex-col items-center border-r border-border py-1.5 duration-300",
                selectedTrendingTime === "volume_6h" && "bg-white/[6%]",
              )}
            >
              <span className="header__table__text font-geistRegular text-xs !text-[#9191A4]">
                6H
              </span>
              <span
                className={cn(
                  "-mt-0.5 inline-block text-nowrap font-geistSemiBold text-[13px]",
                  finalVolumeData?.["volume_6h"].percentage > 0
                    ? "text-success"
                    : "text-destructive",
                )}
              >
                {finalVolumeData?.["volume_6h"].percentage > 0 ? "+" : ""}
                {finalVolumeData?.["volume_6h"].percentage > 1000
                  ? finalVolumeData?.["volume_6h"].percentage
                      .toFixed(0)
                      .toLocaleString()
                  : finalVolumeData?.["volume_6h"].percentage.toFixed(2) || 0}
                %
              </span>
            </button>
            <button
              onClick={() =>
                setSelectedTrendingTime(
                  selectedTrendingTime === "volume_24h" ? "none" : "volume_24h",
                )
              }
              className={cn(
                "col-span-1 flex flex-col items-center py-1.5 duration-300",
                selectedTrendingTime === "volume_24h" && "bg-white/[6%]",
              )}
            >
              <span className="header__table__text font-geistRegular text-xs !text-[#9191A4]">
                24H
              </span>
              <span
                className={cn(
                  "-mt-0.5 inline-block text-nowrap font-geistSemiBold text-[13px]",
                  finalVolumeData?.["volume_24h"].percentage > 0
                    ? "text-success"
                    : "text-destructive",
                )}
              >
                {finalVolumeData?.["volume_24h"].percentage > 0 ? "+" : ""}
                {finalVolumeData?.["volume_24h"].percentage > 1000
                  ? finalVolumeData?.["volume_24h"].percentage
                      .toFixed(0)
                      .toLocaleString()
                  : finalVolumeData?.["volume_24h"].percentage.toFixed(2) || 0}
                %
              </span>
            </button>
          </>
        )}
      </div>

      {selectedTrendingTime !== "none" && (
        <div className="flex h-full w-full flex-shrink-0 gap-x-3 px-3 pb-0 pt-3">
          <div className="h-[172px] w-[78px] rounded-r-[8px] bg-gradient-to-r from-border/0 from-[45%] to-border p-[1px]">
            <div className="flex h-full w-full flex-col justify-between overflow-hidden rounded-r-[7.5px] bg-card pb-[5px] pt-[1px]">
              <div className="flex w-full items-center gap-x-2 pr-2">
                <div className="flex flex-col gap-y-0">
                  <span className="inline-block text-nowrap font-geistRegular text-xs text-fontColorSecondary">
                    TXNS
                  </span>
                  <span className="inline-block text-nowrap font-geistSemiBold text-sm text-fontColorPrimary">
                    {selectedVolumeBasedOnTime?.transactions || 0}
                  </span>
                </div>
              </div>

              <div className="flex w-full items-center gap-x-2 pr-2">
                <div className="flex flex-col gap-y-0">
                  <span className="inline-block text-nowrap font-geistRegular text-xs text-fontColorSecondary">
                    VOLUME
                  </span>
                  <span className="inline-block text-nowrap font-geistSemiBold text-sm text-fontColorPrimary">
                    {formatAmountDollar(
                      selectedVolumeBasedOnTime?.volume_usd || 0,
                    )}
                  </span>
                </div>
              </div>

              <div className="flex w-full items-center gap-x-2 pr-2">
                <div className="flex flex-col gap-y-0">
                  <span className="inline-block text-nowrap font-geistRegular text-xs text-fontColorSecondary">
                    MAKERS
                  </span>
                  <span className="inline-block text-nowrap font-geistSemiBold text-sm text-fontColorPrimary">
                    {selectedVolumeBasedOnTime?.makers || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="h-full flex-grow pt-0.5">
            <CompareableBarChart
              leftValue={selectedVolumeBasedOnTime?.buys || 0}
              rightValue={selectedVolumeBasedOnTime?.sells || 0}
              leftText="BUYS"
              rightText="SELLS"
              formatInUSD={false}
            />
            <CompareableBarChart
              leftValue={selectedVolumeBasedOnTime?.buy_volume_usd || 0}
              rightValue={selectedVolumeBasedOnTime?.sell_volume_usd || 0}
              leftText="BUY VOL"
              rightText="SELL VOL"
              formatInUSD={true}
            />
            <CompareableBarChart
              leftValue={selectedVolumeBasedOnTime?.buyers || 0}
              rightValue={selectedVolumeBasedOnTime?.sellers || 0}
              leftText="BUYERS"
              rightText="SELLERS"
              formatInUSD={false}
            />
          </div>
        </div>
      )}
    </div>
  );
});
