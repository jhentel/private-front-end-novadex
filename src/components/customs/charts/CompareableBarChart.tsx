"use client";

import { formatAmountDollar } from "@/utils/formatAmount";

type CompareableBarChartProps = {
  leftValue: number;
  rightValue: number;
  leftText: string;
  rightText: string;
  prefix?: string;
  suffix?: string;
  formatInUSD: boolean;
};

export default function CompareableBarChart({
  leftValue,
  rightValue,
  leftText,
  rightText,
  prefix,
  suffix,
  formatInUSD,
}: CompareableBarChartProps) {
  const total = leftValue + rightValue;
  const leftPercentage = (leftValue / total) * 100;
  const rightPercentage = (rightValue / total) * 100;

  const formattedLeftValue = formatAmountDollar(leftValue);
  const formattedRightValue = formatAmountDollar(rightValue);

  return (
    <div className="flex h-[62px] w-full flex-col justify-start gap-y-0">
      <div className="flex w-full flex-row-reverse items-center justify-between">
        <span className="font-regular inline-block text-nowrap text-xs text-[#9191A4]">
          {leftText}
        </span>
        <span className="font-regular inline-block text-nowrap text-xs text-[#9191A4]">
          {rightText}
        </span>
      </div>

      <div className="mb-1.5 flex w-full flex-row-reverse items-center justify-between">
        <span className="inline-block text-nowrap font-geistSemiBold text-sm text-fontColorPrimary">
          {`${prefix || ""}${formatInUSD ? formattedLeftValue : leftValue}${suffix || ""}`}
        </span>
        <span className="inline-block text-nowrap font-geistSemiBold text-sm text-fontColorPrimary">
          {`${prefix || ""}${formatInUSD ? formattedRightValue : rightValue}${suffix || ""}`}
        </span>
      </div>

      <div className="flex h-[3px] w-full flex-row-reverse items-center gap-x-0.5">
        <div
          style={{ width: `${leftPercentage || 50}%` }}
          className="h-[3px] rounded-lg bg-[#8CD9B6]"
        ></div>
        <div
          style={{ width: `${rightPercentage || 50}%` }}
          className="h-[3px] rounded-lg bg-[#F65B93]"
        ></div>
      </div>
    </div>
  );
}
