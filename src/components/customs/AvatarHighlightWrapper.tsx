"use client";

import React, { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import CircularSegmentedRing from "@/components/customs/CircularSegmentedRing";
import type { WalletWithColor } from "@/stores/wallets/use-wallet-highlight-colors.store";

interface AvatarHighlightWrapperProps {
  children: React.ReactNode;
  size: number;
  walletHighlights: WalletWithColor[];
}

export const AvatarHighlightWrapper = React.memo(
  ({ children, size, walletHighlights }: AvatarHighlightWrapperProps) => {
    const [open, setOpen] = useState(false);

    let timeoutId: NodeJS.Timeout;

    const handleMouseEnter = () => {
      clearTimeout(timeoutId);
      setOpen(true);
    };

    const handleMouseLeave = () => {
      timeoutId = setTimeout(() => setOpen(false), 100);
    };

    const highlights = walletHighlights.filter(
      (w) => w.color !== "transparent",
    );

    if (highlights.length === 0) {
      return (
        <div
          className="group relative isolate flex items-center justify-center overflow-visible rounded-full z-50"
          style={{ width: size, height: size }}
        >
          {children}
        </div>
      );
    }

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="group relative isolate overflow-visible rounded-full"
            style={{ width: size, height: size }}
          >
            <div className="absolute inset-0">
              <CircularSegmentedRing
                size={size}
                strokeWidth={3}
                gapDegree={highlights.length === 1 ? 0 : 16}
                segments={highlights.map((w) => ({
                  value: 100 / highlights.length,
                  color: w.color,
                }))}
              />
            </div>

            <div className="absolute inset-0 z-10 flex items-center justify-center">
              {children}
            </div>
          </div>
        </PopoverTrigger>
        <PopoverContent
          align="center"
          side="right"
          className="z-[9999] w-fit border-none bg-transparent p-0"
        >
          <div
            className="relative isolate ml-1 max-h-[140px] w-[160px] rounded-lg border border-[#242436] bg-[#080811]"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className="absolute -top-px left-2 z-10 h-px w-1/2 bg-gradient-to-r from-[#FFFFFF00] via-[#FFFFFF]/50 to-[#FFFFFF00]"></div>
            <div className="absolute -bottom-px right-2 z-10 h-px w-1/2 bg-gradient-to-r from-[#FFFFFF00] via-[#FFFFFF]/50 to-[#FFFFFF00]"></div>
            <div className="nova-scroller h-full space-y-2 p-3">
              {highlights.map((wallet) => (
                <div
                  key={wallet?.address}
                  className="flex items-center justify-start gap-2"
                >
                  <div
                    className="size-3 rounded-full"
                    style={{ backgroundColor: wallet?.color }}
                  />
                  <span className="font-geistRegular text-xs">
                    {wallet?.emoji} {wallet?.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  },
);

AvatarHighlightWrapper.displayName = "AvatarHighlightWrapper";
