"use client";

import { useMemo, useEffect, useState, useRef } from "react";
import Image from "next/image";
import { cn } from "@/libraries/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Level } from "@/components/customs/EarnLevels";

export interface EarnLevelProgressProps {
  level: Level;
}

export function EarnLevelProgress({ level }: EarnLevelProgressProps) {
  const { tier, status, currentPts, targetPts, rewardMultiplier } = level;

  const isOngoing = status === "ongoing";
  const isLocked = status === "locked";

  const message = useMemo(() => {
    switch (status) {
      case "ongoing":
        return "Here is your current progress";
      case "complete":
        return "You have completed this level";
      default:
        return "Complete previous level to unlock";
    }
  }, [status]);

  const indicator = useMemo(() => {
    switch (status) {
      case "ongoing":
        return "🟣 On Going";
      case "complete":
        return "👍 Complete";
      default:
        return "🔒 Locked";
    }
  }, [status]);

  const percentage = useMemo(() => {
    if (targetPts === 0) return 0;
    return Math.min(Math.floor((currentPts / targetPts) * 100), 100);
  }, [currentPts, targetPts]);

  return (
    <div className="group relative isolate h-fit w-full overflow-hidden rounded-[20px] bg-[#242436] p-px">
      <div className="absolute inset-0 -left-[100px] flex w-[calc(100%_+_200px)] items-center justify-center opacity-0 duration-500 group-hover:opacity-100">
        <div
          className="h-2/3 w-full bg-white/70 blur-xl"
          style={{ animation: "spin 8s linear infinite" }}
        ></div>
      </div>
      <div className="relative isolate z-10 flex h-[327px] flex-col items-center justify-center gap-4 overflow-hidden rounded-[20px] bg-gradient-to-b from-[#17171F] via-[#080811] to-[#080811] lg:h-[400px]">
        <div className="pt-4 lg:pt-8">
          <div className="flex items-center justify-center gap-2">
            <span className="font-geist text-xl font-[700] leading-8 text-white lg:text-2xl">
              Level {tier}
            </span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative aspect-square h-4 w-4 flex-shrink-0">
                    <Image
                      src="/icons/info-tooltip.png"
                      alt="Info Tooltip Icon"
                      fill
                      quality={100}
                      className="object-contain"
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Level {tier}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="text-center font-geistLight text-[14px] font-light leading-8 text-white lg:text-2xl">
            {message}
          </div>
        </div>

        <div className="relative isolate mb-[60px] h-[170px] w-[340px] flex-1 sm:h-[179px] sm:w-[358px] lg:mb-[72px] lg:h-[200px] lg:w-[400px]">
          <ProgressRing percentage={percentage} />
          {/* <div className="relative isolate h-[170px] w-[320px] sm:h-[179px] sm:w-[358px] lg:h-[200px] lg:w-[400px]">
          {Array.from({ length: 100 }).map((_, index) => (
            <div
              key={index}
              className="absolute bottom-0 left-0 flex w-[170px] origin-bottom-right justify-start sm:w-[179px] lg:w-[200px]"
              style={{ rotate: `${index * 1.8}deg` }}
            >
              <div
                className={cn(
                  "h-px w-[36px] sm:w-[45px] lg:w-[50px]",
                  index < percentage ? "bg-[#DF74FF]" : "bg-[#2F323A]",
                )}
              />
            </div>
          ))}
        </div> */}

          <div className="absolute inset-0 -mt-2 flex flex-col items-center justify-center px-16 pt-16">
            <span className="left-[18px] rounded-full bg-[#FFFFFF1A] px-2 py-1 font-geistSemiBold text-xs font-[600] text-white backdrop-blur-[4px] lg:text-sm">
              {indicator}
            </span>
            <span className="font-geist mb-2 mt-1 text-nowrap bg-gradient-to-b from-[#F4D0FF] to-[#DF74FF] to-80% bg-clip-text text-4xl font-[600] leading-[44px] text-transparent lg:text-5xl lg:leading-[56px]">
              {percentage}%
            </span>
            <div
              className={cn(
                "flex w-full items-center",
                isOngoing ? "justify-between" : "justify-center",
              )}
            >
              {isOngoing ? (
                <div className="flex flex-col items-start justify-center gap-1">
                  <span className="font-geist w-full text-left text-sm font-[400] leading-[18px] text-[#9191A4]">
                    Current
                  </span>
                  <span className="font-geist size-sm text-left font-[600] leading-[18px] text-white">
                    {formatPts(currentPts)} PTS
                  </span>
                </div>
              ) : null}
              <div
                className={cn(
                  "flex flex-col justify-center gap-1",
                  isOngoing ? "items-center" : "items-end",
                )}
              >
                <span
                  className={cn(
                    "font-geist w-full text-sm font-[400] leading-[18px] text-[#9191A4]",
                    isOngoing ? "text-right" : "text-center",
                  )}
                >
                  Target
                </span>
                <span
                  className={cn(
                    "font-geist size-sm font-[600] leading-[18px] text-white",
                    isOngoing ? "text-right" : "text-center",
                  )}
                >
                  {formatPts(targetPts)} PTS
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 isolate mx-3 flex h-[60px] w-full flex-col items-center justify-center gap-1 overflow-hidden">
          <span className="font-geist text-nowrap text-xs font-normal text-[#9191A4]">
            Rewards
          </span>
          <span
            className="font-geist text-nowrap bg-gradient-to-b from-white to-[#FFF3B7] to-80% bg-clip-text text-xl font-[700] italic leading-[22px] text-transparent"
            style={{
              textShadow: isLocked
                ? "0 0 2px white, 0 0 8px white, 0 0 12px white"
                : "0 0 2px rgba(255, 255, 255, 0.8), 0 0 8px rgba(255, 255, 255, 0.6), 0 0 12px rgba(255, 255, 255, 0.4)",
            }}
          >
            {rewardMultiplier}X Multiplier
          </span>
          <div className="absolute bottom-0 mt-2 h-px w-full bg-gradient-to-l from-[#F0810500] via-[#FFFFFF] to-[#F0810500]" />
          <div
            className={cn(
              "absolute -bottom-[78px] h-[78px] w-[280px] blur-xl lg:w-[336px]",
              isLocked ? "bg-white" : "bg-[#FFB77D]",
            )}
            style={{ borderRadius: "100%" }}
          ></div>
        </div>
      </div>
    </div>
  );
}

interface ProgressRingProps {
  percentage: number; // 0 - 100
}

export const ProgressRing: React.FC<ProgressRingProps> = ({ percentage }) => {
  const prevPercentage = useRef(percentage);
  const [direction, setDirection] = useState<"right" | "left">("right");

  useEffect(() => {
    if (percentage > prevPercentage.current) {
      setDirection("right");
    } else if (percentage < prevPercentage.current) {
      setDirection("left");
    }
    prevPercentage.current = percentage;
  }, [percentage]);

  return (
    <div className="relative isolate h-[170px] w-[320px] sm:h-[179px] sm:w-[358px] lg:h-[200px] lg:w-[400px]">
      {Array.from({ length: 100 }).map((_, index) => {
        const isActive = index < percentage;
        const animationClass = isActive
          ? direction === "right"
            ? "animate-slide-in-right"
            : "animate-slide-in-left"
          : "animate-fade-out";

        const delay =
          direction === "right"
            ? {
                // transitionDelay: `${index * 15}ms`,
                // animationDelay: `${index * 15}ms`,
              }
            : {
                transitionDelay: `${index * 10}ms`,
                animationDelay: `${index * 10}ms`,
              };

        return (
          <div
            key={index}
            className="absolute bottom-0 left-0 flex w-[170px] origin-bottom-right justify-start sm:w-[179px] lg:w-[200px]"
            style={{ rotate: `${index * 1.8}deg` }}
          >
            <div
              className={cn(
                "h-px w-[36px] transition-colors duration-700 sm:w-[45px] lg:w-[50px]",
                isActive ? "bg-[#DF74FF]" : "bg-[#2F323A]",
                animationClass,
              )}
              style={delay}
            />
          </div>
        );
      })}
    </div>
  );
};

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
