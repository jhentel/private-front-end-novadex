"use client";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import BaseButton from "@/components/customs/buttons/BaseButton";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useUserWalletStore } from "@/stores/wallet/use-user-wallet.store";
import { useTokenSelectedWalletStore } from "@/stores/token/use-token-selected-wallet.store";
import { cn } from "@/libraries/utils";
import { motion, useAnimation } from "framer-motion";
import Copy from "./Copy";
import { Textarea } from "../ui/textarea";
import { X } from "lucide-react";
import { PopoverClose } from "@radix-ui/react-popover";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import SelectEmoji from "./SelectEmoji";
import { CachedImage } from "./CachedImage";

const WalletTradesInfo = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, []);

  const controls = useAnimation();
  const handleRefreshHoldings = async () => {
    // console.log("Refresh Holdings");
    await controls.start({ rotate: 360 });
    controls.set({ rotate: 0 });
  };
  return (
    <div className="flex w-full flex-col items-center gap-x-1 rounded-[8px] border border-border bg-white/5 md:mb-0 md:h-[48px] md:flex-row md:pl-1">
      <div className="h-[60px] w-full md:h-auto md:w-auto">
        <Popover>
          <PopoverTrigger asChild className="h-full w-full cursor-pointer">
            <div className="flex w-full items-center gap-x-3 rounded-t-[4px] border border-border bg-white/5 px-3 md:w-[300px] md:rounded-[4px]">
              <div className="flex h-full w-[92px] flex-shrink-0 flex-col justify-center">
                <span className="mb-[-0.2rem] flex w-fit items-center justify-center font-geistSemiBold text-[16px] text-fontColorSecondary md:mb-0 md:text-xs">
                  Wallet ABC
                  <div className="relative inline-block aspect-square h-4 w-4">
                    <Image
                      src="/icons/favorite.png"
                      alt="Favorite Icon"
                      fill
                      quality={100}
                      className="object-contain"
                    />
                  </div>
                </span>

                <div className="flex w-fit cursor-pointer items-center justify-between">
                  <div className="line-clamp-1 w-[92px] overflow-hidden font-geistLight text-xs text-fontColorPrimary md:w-auto">
                    6G122124...ump
                    <Copy value="6G122124...ump" />
                  </div>
                </div>
              </div>
              <button
                title="Edit"
                className="relative -mb-2 ml-auto hidden aspect-square size-[12px] md:inline-block"
              >
                <Image
                  src="/icons/wallet-trades-edit.png"
                  alt="Wallet Trades Edit Icon"
                  fill
                  quality={100}
                  className="object-contain"
                />
              </button>
            </div>
          </PopoverTrigger>
          <PopoverContent
            sideOffset={24}
            className="z-[1000] mt-[-0.8rem] w-[412px] rounded-[8px] border border-border bg-card p-0 shadow-[0_0_20px_0_#000000]"
          >
            <>
              <div className="flex w-full items-center justify-start border-b border-border p-4">
                <h4 className="text-nowrap font-geistSemiBold text-[18px] text-fontColorPrimary">
                  Import Wallet
                </h4>

                {/* X for mobile close modal */}
                <PopoverClose className="ml-auto cursor-pointer text-fontColorSecondary">
                  <div className="relative aspect-square h-6 w-6 flex-shrink-0 duration-300 hover:opacity-70">
                    <Image
                      src="/icons/close.png"
                      alt="Close Icon"
                      fill
                      quality={100}
                      className="object-contain"
                    />
                  </div>
                </PopoverClose>
              </div>
              <div className="flex w-full flex-col">
                <div className="flex w-full gap-x-2 p-4 pb-0">
                  <div className="flex flex-col gap-y-1">
                    <Label className="text-xs text-fontColorSecondary">
                      Emoji
                    </Label>
                    <SelectEmoji />
                  </div>
                  <div className="flex w-full flex-col gap-y-1">
                    <Label className="text-xs text-fontColorSecondary">
                      Wallet Name
                    </Label>
                    <Input
                      placeholder="Wallet Name"
                      className="h-[32px] border border-border placeholder:text-fontColorSecondary focus:outline-none"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-y-2 p-4">
                  <Label className="text-xs text-fontColorSecondary">
                    Wallet Address
                  </Label>
                  <Textarea
                    placeholder="wallet name:private key"
                    className="min-h-[128px] border border-border placeholder:text-fontColorSecondary focus:outline-none"
                  />
                </div>
                <div className="flex w-full items-center justify-between border-t border-border p-4">
                  <BaseButton variant="primary" className="h-[32px] w-full">
                    <span className="inline-block whitespace-nowrap font-geistSemiBold text-sm">
                      Submit
                    </span>
                  </BaseButton>
                </div>
              </div>
            </>
          </PopoverContent>
        </Popover>
      </div>

      <div className="relative flex h-full min-h-[110px] w-full flex-col-reverse items-center gap-1 gap-x-0 border-border p-2 md:min-h-0 md:flex-row md:gap-2 md:border-l md:p-1">
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
            <div className="grid w-full flex-grow grid-cols-2 gap-x-2.5 px-1 py-1 md:w-auto md:p-2 md:px-4">
              <div className="relative col-span-1 flex flex-col justify-center rounded-[4px] border-r border-border bg-white/5 px-2 py-1 max-md:border md:rounded-none md:bg-transparent md:p-0">
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
                    147.72359
                  </span>
                </div>
              </div>
              <div className="relative col-span-1 flex flex-col justify-center rounded-[4px] border-border bg-white/5 px-2 py-1 max-md:border md:rounded-none md:border-r md:bg-transparent md:p-0">
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
                    147.72359
                  </span>
                </div>
              </div>
            </div>

            <div className="mx-auto flex h-full w-full items-center gap-x-3 rounded-[4px] bg-success/[12%] p-1 py-1 md:w-auto md:min-w-[290px]">
              <div className="h-[32px] w-1 rounded-[10px] bg-success"></div>

              <div className="flex h-full w-full items-center justify-between">
                <div className="flex h-full flex-col items-start justify-center">
                  <span className="inline-block text-xs text-fontColorSecondary">
                    Change in P&L
                  </span>
                  <span className="mt-[-0.4rem] inline-block space-x-1 font-geistSemiBold">
                    <span className="text-sm text-fontColorPrimary">
                      147.72359
                    </span>
                    <span className="rounded-full bg-white/5 px-2 text-xs text-success">
                      +100.95%
                    </span>
                  </span>
                </div>
                <div className="flex h-full items-end justify-end">
                  <BaseButton
                    onClick={handleRefreshHoldings}
                    variant="gray"
                    size="short"
                    className="size-[32px] bg-white/5"
                  >
                    <motion.div
                      className="relative z-30 aspect-square h-5 w-5 flex-shrink-0"
                      animate={controls}
                      transition={{ duration: 0.5, ease: "linear" }}
                    >
                      <Image
                        src="/icons/refresh.png"
                        alt="Refresh Icon"
                        fill
                        quality={100}
                        className="object-contain"
                      />
                    </motion.div>
                  </BaseButton>
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
