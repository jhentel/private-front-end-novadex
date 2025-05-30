"use client";

// ######## Components 🧩 ########
import Image from "next/image";
import LimitOrdersButtons from "@/components/customs/buttons/footer/LimitOrdersButtons";
import { cn } from "@/libraries/utils";
import Copy from "@/components/customs/Copy";
import SellBuyBadge from "@/components/customs/SellBuyBadge";
import AvatarWithBadges from "@/components/customs/AvatarWithBadges";
import { CachedImage } from "../../CachedImage";

export default function LimitOrdersCard({
  type = "buy",
}: {
  type?: "buy" | "sell";
}) {
  const mintAddress = "6G1...ump";

  return (
    <div
      className={cn(
        "flex-shrink-0 items-center overflow-hidden from-background to-background-1",
        "border-border max-md:rounded-[8px] max-md:border max-md:bg-card",
        "transition-color border-border duration-300 ease-out hover:bg-white/10 md:flex md:h-[64px] md:min-w-max md:pl-4 md:pr-4 md:odd:bg-white/[4%] md:even:bg-transparent",
      )}
    >
      {/* DESKTOP */}
      <>
        <div className="flex h-[64px] min-w-max items-center pr-4 max-md:hidden">
          <div className="flex h-full w-full min-w-[180px] items-center">
            <div className="flex items-center gap-x-2">
              <AvatarWithBadges
                src="/images/trade-history-token.png"
                alt="Trade History Token Image"
                rightType="moonshot"
              />
              <div className="-mt-0.5 flex items-center gap-x-1">
                <span className="inline-block max-w-[80px] overflow-hidden text-nowrap font-geistSemiBold text-xs text-fontColorPrimary">
                  DEGEMG
                </span>
                <Copy value={mintAddress} />
              </div>
            </div>
          </div>
          <div className="flex h-full w-full min-w-[75px] items-center">
            <SellBuyBadge type={type} size="sm" />
          </div>
          <div className="flex h-full w-full min-w-[120px] items-center">
            <span
              className={cn(
                "inline-block text-nowrap text-xs text-fontColorPrimary",
                type === "sell" ? "text-destructive" : "text-success",
              )}
            >
              Buy @ 100k MC
            </span>
          </div>
          <div className="flex h-full w-full min-w-[120px] items-center">
            <div className="flex items-center gap-x-1">
              <span
                className={cn(
                  "inline-block text-nowrap font-geistSemiBold text-xs text-fontColorPrimary",
                  type === "sell" ? "text-destructive" : "text-success",
                )}
              >
                Wallet 1
              </span>
              <Copy value={mintAddress} />
            </div>
          </div>
          <div className="flex h-full w-full min-w-[105px] items-center">
            <div className="flex items-center gap-x-1">
              <div className="relative aspect-square h-[18px] w-[18px] flex-shrink-0">
                <Image
                  src="/icons/migrating-clock.png"
                  alt="White Clock Icon"
                  fill
                  quality={100}
                  className="object-contain"
                />
              </div>
              <span className="inline-block text-nowrap font-geistSemiBold text-xs text-fontColorPrimary">
                23:59:59
              </span>
            </div>
          </div>
          <div className="flex h-full w-full min-w-[150px] items-center">
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
              <span
                className={cn(
                  "inline-block text-nowrap font-geistSemiBold text-xs text-fontColorPrimary",
                  type === "sell" ? "text-destructive" : "text-success",
                )}
              >
                3.5K
              </span>
            </div>
          </div>
          <div className="flex h-full w-full min-w-[110px] items-center justify-end">
            <div className="flex items-center gap-x-2">
              <LimitOrdersButtons />
            </div>
          </div>
        </div>
      </>

      {/* MOBILE */}
      <>
        <div className="group w-full flex-shrink-0 overflow-hidden rounded-[8px] border border-border bg-card duration-300 hover:border-border md:hidden">
          {/* Header - Image, Name, Copy, Time */}
          <div className="relative flex h-8 w-full items-center justify-between overflow-hidden bg-white/[4%] px-3 py-5">
            <div className="relative z-20 flex items-center gap-x-1">
              <AvatarWithBadges
                src="/images/trade-history-token.png"
                alt="Trade History Token Image"
                size="sm"
                classNameParent="mr-1"
              />
              <h4 className="text-nowrap font-geistSemiBold text-xs text-fontColorPrimary">
                DEGEMG
              </h4>
              <h4 className="text-nowrap font-geistRegular text-[10px] uppercase text-fontColorSecondary">
                DEGEMG
              </h4>
              <Copy value={mintAddress} />
            </div>
            <div className="relative z-20 flex items-center gap-x-1">
              <div className="relative aspect-square h-[18px] w-[18px] flex-shrink-0">
                <Image
                  src="/icons/migrating-clock.png"
                  alt="White Clock Icon"
                  fill
                  quality={100}
                  className="object-contain"
                />
              </div>
              <span className="inline-block text-nowrap font-geistSemiBold text-xs text-fontColorPrimary">
                23:59:59
              </span>
            </div>
          </div>

          {/* Content - Type, Trigger, Wallet, Amount, Buttons */}
          <div className="relative flex w-full gap-x-2 p-3">
            <div className="flex flex-col gap-y-1">
              <span className="inline-block text-nowrap font-geistSemiBold text-xs text-fontColorSecondary">
                Type
              </span>
              <span
                className={cn(
                  "inline-block text-nowrap font-geistSemiBold text-xs",
                  type === "sell" ? "text-destructive" : "text-success",
                )}
              >
                {type === "sell" ? "Sell" : "Buy"}
              </span>
            </div>

            <div className="flex flex-col gap-y-1">
              <span className="inline-block text-nowrap font-geistSemiBold text-xs text-fontColorSecondary">
                Trigger
              </span>
              <span
                className={cn(
                  "flex items-center gap-1 text-nowrap font-geistSemiBold text-xs",
                  type === "sell" ? "text-destructive" : "text-success",
                )}
              >
                3.5K
              </span>
            </div>

            <div className="flex flex-col gap-y-1">
              <span className="inline-block text-nowrap font-geistSemiBold text-xs text-fontColorSecondary">
                Wallet
              </span>
              <div className="flex items-center gap-x-1">
                <span
                  className={cn(
                    "inline-block text-nowrap font-geistSemiBold text-xs text-fontColorPrimary",
                    type === "sell" ? "text-destructive" : "text-success",
                  )}
                >
                  Wallet 1
                </span>
                <Copy value={mintAddress} />
              </div>
            </div>

            <div className="flex flex-col gap-y-1">
              <span className="inline-block text-nowrap font-geistSemiBold text-xs text-fontColorSecondary">
                Amount
              </span>
              <span
                className={cn(
                  "flex items-center gap-1 text-nowrap font-geistSemiBold text-xs",
                  type === "sell" ? "text-destructive" : "text-success",
                )}
              >
                <div className="relative aspect-square h-4 w-4 flex-shrink-0">
                  <Image
                    src="/icons/solana-sq.svg"
                    alt="Solana SQ Icon"
                    fill
                    quality={100}
                    className="object-contain"
                  />
                </div>
                3.5K
              </span>
            </div>

            <div className="ml-auto flex items-center justify-end gap-2">
              <LimitOrdersButtons />
            </div>
          </div>
        </div>
      </>
    </div>
  );
}
