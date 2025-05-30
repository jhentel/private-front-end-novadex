"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import { useState } from "react";
import {
  useActivePresetStore,
  Preset,
} from "@/stores/dex-setting/use-active-preset.store";
// ######## Components 🧩 ########
import Image from "next/image";
import CopyTradingButtons from "../../buttons/footer/CopyTradingButtons";
// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";
import Copy from "../../Copy";
import TaskStatus from "../../TaskStatus";
import PresetSelectionButtons from "../../PresetSelectionButtons";
import { CachedImage } from "../../CachedImage";

export default function CopyTradingCard({
  isRunning = true,
}: {
  isRunning?: boolean;
}) {
  const walletAddress = "0x93d...56ss";

  return (
    <div
      className={cn(
        "flex-shrink-0 items-center overflow-hidden from-background to-background-1",
        "border max-md:rounded-[8px] max-md:bg-card md:border-0",
        "transition-color border-border duration-300 ease-out hover:bg-white/10 md:flex md:h-[64px] md:min-w-max md:pl-4 md:pr-4 md:odd:bg-white/[4%] md:even:bg-transparent",
      )}
    >
      {/* DESKTOP */}
      <div className="hidden h-[64px] w-full min-w-max items-center pl-4 pr-4 md:flex">
        <div className="flex h-full w-full min-w-[50px] items-center">
          <TaskStatus isCompleted={false} isRunning={isRunning} />
        </div>
        <div className="flex h-full w-full min-w-[100px] items-center">
          <span className="line-clamp-1 flex w-fit max-w-[200px] items-center justify-center gap-x-1 overflow-hidden text-nowrap font-geistSemiBold text-sm text-fontColorSecondary underline decoration-dashed">
            {walletAddress}
            <Copy value={walletAddress} />
          </span>
        </div>
        <div className="flex h-full w-full min-w-[100px] items-center">
          <div className="flex items-center gap-x-1">
            <div className="relative aspect-auto h-[16px] w-[16px] flex-shrink-0">
              <CachedImage
                src="/icons/solana-sq.svg"
                alt="Solana SQ Icon"
                fill
                quality={50}
                className="object-contain"
              />
            </div>
            <span className="inline-block text-nowrap font-geistSemiBold text-sm text-fontColorPrimary">
              3.5K
            </span>
          </div>
        </div>
        <div className="flex h-full w-full min-w-[150px] flex-col justify-center">
          <span className="inline-block text-nowrap font-geistSemiBold text-xs text-fontColorPrimary">
            39K
          </span>
          <div className="flex gap-1 text-nowrap font-geistSemiBold text-xs text-fontColorPrimary">
            <span className="text-success">$22K</span>
            <span className="text-fontColorSecondary">/</span>
            <span className="text-destructive">16864</span>
          </div>
        </div>
        <div className="flex h-full w-full min-w-[150px] items-center">
          <PresetSelectionButtons />
        </div>
        <div className="flex h-full w-full min-w-[150px] items-center justify-end">
          <div className="flex items-center gap-x-2">
            <CopyTradingButtons />
          </div>
        </div>
      </div>

      <div className="flex w-full flex-col md:hidden">
        {/* Header */}
        <div className="relative flex h-8 w-full items-center justify-between overflow-hidden bg-white/[4%] px-3 py-5">
          <div className="relative z-20 flex items-center gap-x-2">
            <h4 className="text-nowrap font-geistSemiBold text-xs text-fontColorPrimary">
              Task 1
            </h4>
          </div>
          <div className="relative z-20 flex items-center gap-x-2">
            <TaskStatus isCompleted={false} isRunning={isRunning} />
          </div>
        </div>

        {/* Content */}
        <div className="flex w-full flex-col gap-y-4 py-2">
          {/* Data Grid */}
          <div className="flex w-full gap-x-4 px-3">
            <div className="flex flex-col gap-y-1">
              <span className="text-xs text-fontColorSecondary">Wallet</span>
              <span className="truncate text-xs text-fontColorPrimary">
                {walletAddress}
              </span>
            </div>

            <div className="flex flex-col gap-y-1">
              <span className="text-xs text-fontColorSecondary">SOL</span>
              <div className="flex items-center gap-x-1">
                <div className="relative aspect-square h-4 w-4">
                  <Image
                    src="/icons/solana-sq.svg"
                    alt="Solana Icon"
                    fill
                    quality={100}
                    className="object-contain"
                  />
                </div>
                <span className="font-geistSemiBold text-xs text-fontColorPrimary">
                  3.5K
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-y-1">
              <span className="text-xs text-fontColorSecondary">Trades</span>
              <span className="font-geistSemiBold text-xs text-fontColorPrimary">
                47481
              </span>
            </div>

            <div className="flex flex-col gap-y-1">
              <span className="text-xs text-fontColorSecondary">P&L</span>
              <div className="flex items-center gap-x-1">
                <span className="font-geistSemiBold text-xs text-success">
                  +100.95%
                </span>
                <span className="text-xs text-fontColorSecondary">/</span>
                <span className="font-geistSemiBold text-xs text-destructive">
                  -16864
                </span>
              </div>
            </div>
          </div>

          {/* Actions Row */}
          <div className="flex items-center justify-end gap-x-2 border-t border-border px-3 pt-2">
            <PresetSelectionButtons />
            <CopyTradingButtons />
          </div>
        </div>
      </div>
    </div>
  );
}
