import React from "react";
import Image from "next/image";
import BaseButton from "@/components/customs/buttons/BaseButton";

import { cn } from "@/libraries/utils";
import { formatAmountWithoutLeadingZero } from "@/utils/formatAmount";

export default function PnLTrigger({
  profitAndLoss,
  profitAndLossPercentage,
  handleReload,
  isLoading,
  isLoadingHolding,
  countdown,
}: {
  profitAndLoss: string | number;
  profitAndLossPercentage: string | number;
  handleReload?: (e: React.MouseEvent) => void;
  isLoading?: boolean;
  isLoadingHolding?: boolean;
  countdown?: number;
}) {
  return (
    <div
      id="pnl-trigger"
      className={cn(
        "mx-full flex h-full w-full items-center gap-x-3 rounded-[4px] py-1 pl-1 pr-2 md:min-w-[290px] md:pr-1 xl:w-auto",
        Number(profitAndLoss) > 0 ? "bg-success/[8%]" : "bg-destructive/[8%]",
      )}
    >
      <div
        className={cn(
          "h-[32px] w-1 rounded-[10px] bg-success",
          Number(profitAndLoss) > 0 ? "bg-success" : "bg-destructive",
        )}
      ></div>

      <div className="flex h-full w-full items-center justify-between">
        <div className="flex h-full flex-col items-start justify-center">
          <span className="inline-block text-[10px] text-fontColorSecondary">
            P&L
          </span>
          <span className="mt-[-0.4rem] inline-block space-x-1 font-geistSemiBold">
            <span className="text-[14px] text-fontColorPrimary">
              {!isLoadingHolding ? (
                <>
                  {profitAndLoss === "-"
                    ? "-"
                    : Number(profitAndLoss) > 0
                      ? "+"
                      : ""}
                  {profitAndLoss === "-"
                    ? ""
                    : formatAmountWithoutLeadingZero(Number(profitAndLoss))}
                </>
              ) : (
                "-"
              )}
            </span>
            <span
              className={cn(
                "rounded-full bg-secondary px-2 text-[12px]",
                Number(profitAndLossPercentage) > 0
                  ? "text-success"
                  : "text-destructive",
              )}
            >
              {!isLoadingHolding ? (
                <>
                  {profitAndLossPercentage === "-"
                    ? "-"
                    : Number(profitAndLossPercentage) > 0
                      ? "+"
                      : ""}
                  {profitAndLossPercentage === "-"
                    ? ""
                    : Number(profitAndLossPercentage).toFixed(2) + "%"}
                </>
              ) : (
                "-"
              )}
            </span>
          </span>
        </div>
        <div className="ml-auto flex h-full items-end justify-end">
          <button
            className="flex items-center rounded-[3px] bg-secondary md:mb-0"
            title="Dropdown"
          >
            <div className="relative aspect-square h-5 w-5 flex-shrink-0">
              <Image
                src="/icons/accordion.png"
                alt="Dropdown Arrow Icon"
                fill
                quality={100}
                className="object-contain"
              />
            </div>
          </button>
        </div>
        {isLoading && countdown && countdown > 0 ? (
          <span className="ml-2 text-[12px] text-fontColorSecondary">
            {`00:${String(countdown).padStart(2, "0")}`}
          </span>
        ) : (
          !!handleReload && (
            <div className="ml-1 flex h-full items-end">
              <BaseButton
                onClick={handleReload}
                variant="gray"
                size="short"
                className="size-[32px] bg-secondary"
                isLoading={isLoading}
              >
                <div className="relative z-30 aspect-square h-5 w-5 flex-shrink-0">
                  <Image
                    src="/icons/refresh.png"
                    alt="Refresh Icon"
                    fill
                    quality={100}
                    className="object-contain"
                  />
                </div>
              </BaseButton>
            </div>
          )
        )}
      </div>
    </div>
  );
}
