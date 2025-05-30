"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import { useState } from "react";
// ######## Components 🧩 ########
import Image from "next/image";
// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";

type PayoutCardProps = {
  context: string;
  isFetching: boolean;
  values: {
    USD: string;
    SOL: string;
  };
  className?: string;
};

export default function PayoutCard({
  context,
  isFetching,
  values,
  className,
}: PayoutCardProps) {
  const [selectedCurrency, setSelectedCurrency] = useState<"USD" | "SOL">(
    "USD",
  );

  return (
    <div
      className={cn(
        "absolute hidden h-[88px] w-[240px] flex-col gap-y-2 rounded-[15px] border border-white/20 bg-white/[6%] p-3 shadow-[12px_12px_90px_0_rgba(0,0,0,0.5)] backdrop-blur-[50px] lg:flex",
        className,
      )}
    >
      <div className="flex w-full items-center justify-between">
        <span className="inline-block text-nowrap text-sm text-fontColorSecondary">
          {context}
        </span>
        <div className="relative h-[24px] w-full max-w-[84px] rounded-[32px] bg-secondary p-[3px]">
          <div className="flex h-full w-full rounded-[6px]">
            <button
              onClick={() => setSelectedCurrency("USD")}
              className={cn(
                "w-full cursor-pointer rounded-[8px] font-geistSemiBold text-xs text-fontColorSecondary duration-300 hover:text-[#cccce1]",
                selectedCurrency === "USD" &&
                  "bg-white/[4%] text-fontColorPrimary",
              )}
            >
              USD
            </button>
            <button
              onClick={() => setSelectedCurrency("SOL")}
              className={cn(
                "w-full cursor-pointer rounded-[8px] font-geistSemiBold text-xs text-fontColorSecondary duration-300 hover:text-[#cccce1]",
                selectedCurrency === "SOL" &&
                  "bg-white/[4%] text-fontColorPrimary",
              )}
            >
              SOL
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-x-3">
        <div className="relative aspect-auto h-5 w-6 flex-shrink-0">
          <Image
            src={
              selectedCurrency === "USD"
                ? "/icons/usdc.svg"
                : "/icons/solana.svg"
            }
            alt="Solana Icon"
            fill
            quality={100}
            className="object-contain"
          />
        </div>
        {isFetching ? (
          <div className="h-5 w-16 animate-pulse rounded-[8px] bg-white/[8%]" />
        ) : (
          <span className="inline-block text-nowrap font-geistSemiBold text-[24px] text-fontColorPrimary">
            {values[selectedCurrency]}
          </span>
        )}
      </div>
    </div>
  );
}
