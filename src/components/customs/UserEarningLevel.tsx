"use client";

import { cn } from "@/libraries/utils";
import Image from "next/image";

export default function UserEarningLevel() {
  const percentage = 70;

  return (
    <div className="relative isolate h-7 min-w-16 rounded-l-md bg-gradient-to-r from-[#E077FF] to-[#5E30A800] p-px">
      <button className="peer flex h-[26px] items-center justify-start gap-[6px] rounded-l-md bg-gradient-to-r from-[#17171F] to-[#080811] py-[6px] pr-[12px]">
        <span className="rounded-r-[2px] bg-gradient-to-r from-[#DF74FF00] via-[#DF74FF] to-[#FFFFFF] pl-2 pr-1 pt-0.5 font-geistBlack text-[8px] leading-3 text-[#080811]">
          LEVEL
        </span>
        <span className="text-nowrap bg-gradient-to-t from-[#DF74FF00] via-[#DF74FF] to-[#FFFFFF] bg-clip-text font-geistBlack text-xl font-[600] leading-4 text-transparent">
          7
        </span>
      </button>

      <div className="absolute -bottom-[80px] -right-1 w-[278px] scale-75 opacity-0 transition-all duration-200 ease-in peer-hover:-bottom-[100px] peer-hover:scale-100 peer-hover:opacity-100 xl:-right-[110px]">
        <div className="relative isolate flex h-[27px] w-full flex-col items-center justify-center gap-1 overflow-hidden">
          <div className="relative flex w-full justify-end px-4 xl:justify-center">
            <Image
              src="/images/decorations/level-pointer-decoration.svg"
              alt="Level Pointer"
              width={36}
              height={26}
              quality={100}
            />
            <div className="absolute -bottom-2 z-10 size-4 -translate-x-1/2 rounded-full bg-[#DF74FF] blur max-xl:right-4 xl:left-1/2" />
          </div>
          <div className="absolute bottom-0 mt-2 h-px w-[246px] bg-gradient-to-l from-[#DF74FF00] via-[#FFFFFF] to-[#DF74FF00]" />
          <div
            className="absolute -bottom-[36px] h-[36px] w-[190px] bg-[#E97DFF] blur-md max-xl:right-1"
            style={{ borderRadius: "100%" }}
          ></div>
        </div>
        <div className="relative isolate flex h-[62px] w-full items-center justify-between gap-4 rounded-md border border-[#242436] bg-[#080811] px-3 py-2">
          <div className="flex flex-col items-start justify-center gap-1">
            <span className="font-geist w-full text-left text-xs font-[400] leading-[18px] text-[#9191A4]">
              Current
            </span>
            <span className="font-geist text-left text-xs font-[600] leading-[18px] text-white">
              {formatPts(23750)} PTS
            </span>
          </div>

          <div className="relative isolate flex h-full w-20 items-center justify-center">
            {Array.from({ length: 50 }).map((_, index) => (
              <div
                key={index}
                className="absolute bottom-0 left-0 flex w-10 origin-bottom-right justify-start"
                style={{ rotate: `${index * 3.6}deg` }}
              >
                <div
                  className={cn(
                    "h-px w-2",
                    index * 2 < percentage ? "bg-[#DF74FF]" : "bg-[#2F323A]",
                  )}
                />
              </div>
            ))}

            <span className="font-geist mt-6 text-nowrap bg-gradient-to-b from-[#F4D0FF] to-[#DF74FF] to-80% bg-clip-text text-[16px] font-[600] leading-6 text-transparent">
              {percentage}%
            </span>
          </div>

          <div className="flex flex-col items-end justify-center gap-1">
            <span className="font-geist w-full text-right text-xs font-[400] leading-[18px] text-[#9191A4]">
              Target
            </span>
            <span className="font-geist text-right text-xs font-[600] leading-[18px] text-white">
              {formatPts(25000)} PTS
            </span>
          </div>
          <div className="absolute bottom-0 right-0 h-px w-3/4 bg-gradient-to-r from-[#FFFFFF00] via-[#FFFFFF8A]/50 to-[#FFFFFF00]" />
        </div>
      </div>
    </div>
  );
}
export function formatPts(value: number): string {
  const absValue = Math.abs(value);
  let suffix = "";
  let shortValue = value;

  if (absValue >= 1_000_000_000) {
    shortValue = value / 1_000_000_000;
    suffix = "B";
  } else if (absValue >= 1_000_000) {
    shortValue = value / 1_000_000;
    suffix = "M";
  }

  const formatted = new Intl.NumberFormat("us-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(shortValue);

  return `${formatted}${suffix}`;
}
