import React from "react";
import Image from "next/image";
import Link from "next/link";
import AddressWithEmojis from "@/components/customs/AddressWithEmojis";
import CircleCount from "@/components/customs/CircleCount";
import GradientProgressBar from "@/components/customs/GradientProgressBar";
import { ChartHolderInfo, TokenInfo } from "@/types/ws-general";
import {
  formatAmount,
  formatAmountDollar,
  formatAmountWithoutLeadingZero,
} from "@/utils/formatAmount";
import { CachedImage } from "../../CachedImage";
import { truncateString } from "@/utils/truncateString";
import WalletTrackerPopover from "../../tables/token/Trades/WalletTrackerPopover";
import { Wallet } from "@/apis/rest/wallet-manager";
import { cn } from "@/libraries/utils";

interface ViewProps {
  rank: number;
  holder: ChartHolderInfo;
  holdersBought: string;
  holdersSold: string;
  holdersRemaining?: string;
  getRemainingValue: (
    type: "amount" | "percentage" | "total" | "amount_in_sol",
  ) => number;
  isTradeMatchWithExistingTrackedWallet:
    | { address: string; name?: string; emoji?: string }
    | undefined;
  isTradeMatchWithExistingUserWallet: Wallet | undefined;
  remainingScreenWidth?: number;
  tokenData?: TokenInfo;
}

export const DesktopView = React.memo(
  ({
    rank,
    holder,
    holdersBought,
    holdersSold,
    holdersRemaining,
    getRemainingValue,
    isTradeMatchWithExistingTrackedWallet,
    isTradeMatchWithExistingUserWallet,
    tokenData,
  }: ViewProps) => (
    <div className="flex h-[72px] w-full pr-6">
      <div className="hidden h-full w-[72px] flex-shrink-0 items-center justify-center xl:flex">
        <div>
          {rank <= 3 ? (
            <div className="relative aspect-square size-8 flex-shrink-0">
              <Image
                src={`/icons/token/rank-${rank}.png`}
                alt="Rank Icon"
                fill
                quality={100}
                className="object-contain"
              />
            </div>
          ) : (
            <span className="inline-block text-nowrap font-geistSemiBold text-sm text-fontColorSecondary">
              {rank}
            </span>
          )}
        </div>
      </div>
      {isTradeMatchWithExistingTrackedWallet ? (
        <Link
          href={"https://solscan.io/account/" + holder.maker}
          className="hidden h-full w-full min-w-[140px] items-center xl:flex min-[1500px]:min-w-[200px]"
          target="_blank"
        >
          <div className="flex gap-x-1">
            <AddressWithEmojis
              walletDefault
              address={truncateString(
                isTradeMatchWithExistingTrackedWallet?.name || "",
                14,
              )}
              trackedWalletIcon={isTradeMatchWithExistingTrackedWallet?.emoji}
            />
            <CircleCount value={holder?.buys + holder?.sells} />
          </div>
        </Link>
      ) : isTradeMatchWithExistingUserWallet ? (
        <div className="hidden h-full w-full min-w-[140px] items-center xl:flex min-[1500px]:min-w-[200px]">
          <div className="flex gap-x-1">
            <AddressWithEmojis
              walletDefault
              address={truncateString(
                isTradeMatchWithExistingUserWallet?.name || "",
                14,
              )}
              isUserWallet
            />
            <CircleCount value={holder?.buys + holder?.sells} />
          </div>
        </div>
      ) : (
        <div className="hidden h-full w-full min-w-[140px] items-center xl:flex min-[1500px]:min-w-[200px]">
          <WalletTrackerPopover
            walletDefault
            circleCount={holder?.buys + holder?.sells}
            isDeveloper={holder.is_developer}
            isFirst={false}
            makerAddress={holder?.maker}
            emojis={[
              ...(holder.animal.length > 0 ? [holder.animal + ".svg"] : []),
              ...(holder.is_insider ? ["white-anonymous.svg"] : []),
              ...(holder.is_sniper ? ["sniper.svg"] : []),
            ]}
          />
        </div>
      )}
      <div className="hidden h-full w-full min-w-[140px] flex-col items-start justify-center xl:flex min-[1500px]:min-w-[200px]">
        <div className="flex items-center gap-x-1">
          <div className="relative aspect-auto size-4 flex-shrink-0">
            <CachedImage
              src={
                holdersBought === "USDC"
                  ? "/icons/usdc-colored.svg"
                  : "/icons/solana-sq.svg"
              }
              alt={holdersBought === "USDC" ? "USDC Icon" : "Solana Icon"}
              fill
              quality={50}
              className="object-contain"
            />
          </div>
          <span className="inline-block text-nowrap font-geistSemiBold text-sm text-fontColorPrimary">
            {holdersBought === "USDC"
              ? formatAmountDollar(holder.bought_usd)
              : formatAmountWithoutLeadingZero(holder.bought_sol, 3, 2)}
          </span>
        </div>
        <span className="inline-block text-nowrap text-sm text-fontColorSecondary">
          {formatAmount(holder.bought_tokens, 2)} / {holder.buys}
        </span>
      </div>

      <div className="hidden h-full w-full min-w-[140px] flex-col items-start justify-center xl:flex min-[1500px]:min-w-[200px]">
        <div className="flex items-center gap-x-1">
          <div className="relative aspect-auto size-4 flex-shrink-0">
            <CachedImage
              src={
                holdersSold === "USDC"
                  ? "/icons/usdc-colored.svg"
                  : "/icons/solana-sq.svg"
              }
              alt="Solana Icon"
              fill
              quality={100}
              className="object-contain"
            />
          </div>
          <span className="inline-block text-nowrap font-geistSemiBold text-sm text-fontColorPrimary">
            {holdersSold === "USDC"
              ? formatAmountDollar(holder.sold_usd)
              : formatAmountWithoutLeadingZero(holder.sold_sol, 3, 2)}
          </span>
        </div>
        <span className="inline-block text-nowrap text-sm text-fontColorSecondary">
          {formatAmount(holder.sold_tokens, 2)} / {holder.sells}
        </span>
      </div>

      <div className="hidden h-full w-full min-w-[140px] items-center xl:flex min-[1500px]:min-w-[200px]">
        <div className="flex items-center gap-x-1">
          <span className="inline-block text-nowrap font-geistSemiBold text-sm text-fontColorPrimary">
            {formatAmount(holder.percentage_owned, 2)}%
          </span>
        </div>
      </div>

      <div className="hidden h-full w-full min-w-[150px] flex-col items-start justify-center gap-y-1 xl:flex">
        <div className="flex items-center gap-x-1">
          <div className="flex items-center gap-x-1">
            <div className="flex items-center justify-center gap-x-1 text-nowrap font-geistSemiBold text-sm text-fontColorPrimary">
              <div className="relative aspect-auto size-4 flex-shrink-0">
                <CachedImage
                  src={
                    tokenData?.image && holdersRemaining === "COIN"
                      ? tokenData.image
                      : !tokenData?.image && holdersRemaining === "COIN"
                        ? "/icons/usdc.svg"
                        : "/icons/solana-sq.svg"
                  }
                  alt={"Solana Icon"}
                  fill
                  quality={100}
                  className="rounded-full object-contain"
                />
              </div>
              {holdersRemaining === "COIN"
                ? formatAmount(getRemainingValue("amount"), 2)
                : formatAmountWithoutLeadingZero(
                    getRemainingValue("amount_in_sol"),
                    2,
                  )}
            </div>
            {/* <span className="inline-block text-nowrap font-geistSemiBold text-sm text-fontColorPrimary"> */}
            {/*   {formatAmount(getRemainingValue("amount"), 2)} */}
            {/* </span> */}
            {/* <span className="inline-block text-nowrap font-geistSemiBold text-sm text-foreground"> */}
            {/*   of */}
            {/* </span> */}
            {/* <span className="inline-block text-nowrap font-geistSemiBold text-sm text-fontColorPrimary"> */}
            {/*   {formatAmount(getRemainingValue("total"), 2)} */}
            {/* </span> */}
          </div>
          <span className="flex h-[16px] items-center justify-center text-nowrap rounded-full bg-white/[8%] px-1 py-0.5 font-geistRegular text-xs text-fontColorSecondary">
            {getRemainingValue("percentage").toFixed(2)}%
          </span>
        </div>

        <GradientProgressBar
          bondingCurveProgress={getRemainingValue("percentage")}
          className="h-[4px]"
        />
      </div>
    </div>
  ),
);

DesktopView.displayName = "DesktopView";

export const MobileView = React.memo(
  ({
    rank,
    holder,
    // holdersBought,
    holdersSold,
    getRemainingValue,
    isTradeMatchWithExistingTrackedWallet,
    isTradeMatchWithExistingUserWallet,
    remainingScreenWidth,
    tokenData,
  }: ViewProps) => (
    <div className="flex w-full flex-col">
      <div className="relative flex h-8 w-full items-center justify-between overflow-hidden bg-white/[4%] px-3 py-5">
        <div className="flex items-center gap-x-2">
          {rank <= 3 ? (
            <div className="relative aspect-square h-6 w-6 flex-shrink-0">
              <Image
                src={`/icons/token/rank-${rank}.png`}
                alt="Rank Icon"
                fill
                quality={100}
                className="object-contain"
              />
            </div>
          ) : (
            <span className="font-geistSemiBold text-xs text-fontColorSecondary">
              {rank}
            </span>
          )}
          <span className="text-nowrap font-geistSemiBold text-xs text-border">
            |
          </span>
          {isTradeMatchWithExistingTrackedWallet ? (
            <Link
              href={"https://solscan.io/account/" + holder.maker}
              className="flex items-center gap-x-1"
              target="_blank"
            >
              <div className="flex gap-x-1">
                <AddressWithEmojis
                  walletDefault
                  address={truncateString(
                    isTradeMatchWithExistingTrackedWallet?.name || "",
                    14,
                  )}
                  trackedWalletIcon={
                    isTradeMatchWithExistingTrackedWallet?.emoji
                  }
                />
                <CircleCount value={holder?.buys + holder?.sells} />
              </div>
            </Link>
          ) : isTradeMatchWithExistingUserWallet ? (
            <div className="flex items-center gap-x-1">
              <div className="flex gap-x-1">
                <AddressWithEmojis
                  walletDefault
                  address={truncateString(
                    isTradeMatchWithExistingUserWallet?.name || "",
                    14,
                  )}
                  isUserWallet
                />
                <CircleCount value={holder?.buys + holder?.sells} />
              </div>
            </div>
          ) : (
            <WalletTrackerPopover
              walletDefault
              circleCount={holder?.buys + holder?.sells}
              isDeveloper={holder.is_developer}
              isFirst={false}
              makerAddress={holder?.maker}
              emojis={[
                ...(holder.animal.length > 0 ? [holder.animal + ".svg"] : []),
                ...(holder.is_insider ? ["white-anonymous.svg"] : []),
                ...(holder.is_sniper ? ["sniper.svg"] : []),
              ]}
            />
          )}
        </div>
      </div>

      <div
        className={cn(
          "grid grid-cols-3 gap-2 p-3 xl:grid-cols-4",
          remainingScreenWidth && "xl:grid-cols-3",
        )}
      >
        <div className="flex flex-col gap-y-1">
          <span className="text-nowrap text-xs text-fontColorSecondary">
            % Owned
          </span>
          <div className="flex items-center gap-x-1">
            <div className={cn("relative aspect-auto size-4 flex-shrink-0")}>
              <CachedImage
                src={tokenData?.image ? tokenData.image : "/icons/usdc.svg"}
                alt="Solana SQ Icon"
                fill
                quality={50}
                className={cn("object-contain", tokenData && "rounded-full")}
              />
            </div>
            <span className="inline-block text-nowrap font-geistSemiBold text-xs text-fontColorPrimary">
              {formatAmount(holder.percentage_owned, 2)}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-y-1">
          <span className="text-nowrap text-xs text-fontColorSecondary">
            Bought
          </span>
          <div className="flex flex-col items-start">
            <div className="flex items-center gap-x-1">
              <div className="relative aspect-auto size-4 flex-shrink-0">
                <Image
                  src="/icons/usdc-colored.svg"
                  alt="USDC Icon"
                  fill
                  quality={100}
                  className="object-contain"
                />
              </div>
              <span className="inline-block text-nowrap font-geistSemiBold text-xs text-fontColorPrimary">
                {formatAmountDollar(holder.bought_usd)}
              </span>
            </div>
            <span className="inline-block text-nowrap text-xs text-fontColorSecondary">
              {formatAmount(holder.bought_tokens, 2)} / {holder.buys}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-y-1">
          <span className="text-nowrap text-xs text-fontColorSecondary">
            Sold
          </span>
          <div className="flex flex-col items-start">
            <div className="flex items-center gap-x-1">
              <div className={cn("relative aspect-auto size-4 flex-shrink-0")}>
                <Image
                  src="/icons/solana-sq.svg"
                  alt="Solana Icon"
                  fill
                  quality={100}
                  className={cn("object-contain", tokenData && "rounded-full")}
                />
              </div>
              <span className="inline-block text-nowrap font-geistSemiBold text-xs text-fontColorPrimary">
                {formatAmountWithoutLeadingZero(holder.sold_sol)}
              </span>
            </div>
            <span className="inline-block text-nowrap text-xs text-fontColorSecondary">
              {formatAmount(holder.sold_tokens, 2)} / {holder.sells}
            </span>
          </div>
        </div>

        <div
          className={cn(
            "hidden flex-col gap-y-1 xl:flex",
            remainingScreenWidth! < 1280 && "xl:hidden",
          )}
        >
          <div className="flex items-center gap-x-1">
            <span className="text-nowrap text-xs text-fontColorSecondary">
              Remaining
            </span>
            <span className="flex h-[16px] items-center justify-center text-nowrap rounded-full bg-white/[8%] px-1 py-0.5 font-geistRegular text-[10px] text-fontColorSecondary">
              {getRemainingValue("percentage").toFixed(2)}%
            </span>
          </div>
          <div className="flex flex-col items-start justify-center gap-y-1">
            <div className="flex items-center gap-x-1">
              <div className="flex items-center gap-x-1">
                <span className="inline-block text-nowrap font-geistSemiBold text-xs text-fontColorPrimary">
                  {formatAmount(getRemainingValue("amount"), 2)}
                </span>
                <span className="inline-block text-nowrap font-geistSemiBold text-xs text-foreground">
                  of
                </span>
                <span className="inline-block text-nowrap font-geistSemiBold text-xs text-fontColorPrimary">
                  {formatAmount(getRemainingValue("total"), 2)}
                </span>
              </div>
            </div>
            <GradientProgressBar
              bondingCurveProgress={getRemainingValue("percentage")}
              className="h-[4px]"
            />
          </div>
        </div>
      </div>
      <div
        className={cn(
          "col-span-3 flex flex-col items-start justify-center gap-y-1 border-t border-border px-3 py-2 xl:hidden",
          remainingScreenWidth! < 1280 && "xl:flex",
        )}
      >
        <div className="flex items-center gap-x-1">
          <span className="flex items-center gap-1 text-nowrap font-geistSemiBold text-sm text-fontColorPrimary">
            <div className="relative aspect-auto size-4 flex-shrink-0">
              <CachedImage
                src={"/icons/solana-sq.svg"}
                alt="Amount Icon"
                fill
                quality={100}
                className="object-contain"
              />
            </div>
            {formatAmountWithoutLeadingZero(
              getRemainingValue("amount_in_sol"),
              2,
            )}
          </span>
          {/* <span className="inline-block text-nowrap font-geistSemiBold text-xs text-fontColorPrimary"> */}
          {/*   {formatAmount(getRemainingValue("amount"), 2)} */}
          {/* </span> */}
          {/* <span className="inline-block text-nowrap font-geistSemiBold text-xs text-foreground"> */}
          {/*   of */}
          {/* </span> */}
          {/* <span className="inline-block text-nowrap font-geistSemiBold text-xs text-fontColorPrimary"> */}
          {/*   {formatAmount(getRemainingValue("total"), 2)} */}
          {/* </span> */}
          <span className="flex h-[16px] items-center justify-center text-nowrap rounded-full bg-white/[8%] px-1 py-0.5 font-geistRegular text-[10px] text-fontColorSecondary">
            {getRemainingValue("percentage").toFixed(2)}%
          </span>
        </div>
        <GradientProgressBar
          bondingCurveProgress={getRemainingValue("percentage")}
          className="h-[4px] max-w-[200px]"
        />
      </div>
    </div>
  ),
);

MobileView.displayName = "MobileView";
