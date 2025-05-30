"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import { useTokenCardsFilter } from "@/stores/token/use-token-cards-filter.store";
// ######## Components 🧩 ########
import { DesktopView, MobileView } from "./HoldersCardViews";
// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";
// ######## Types 🗨️ ########
import { ChartHolderInfo, TokenInfo } from "@/types/ws-general";
import { useCallback, useMemo } from "react";
import { useWindowSizeStore } from "@/stores/use-window-size.store";
import { usePopupStore } from "@/stores/use-popup-state";
import { useWalletTrackerMessageStore } from "@/stores/footer/use-wallet-tracker-message.store";
import { useUserWalletStore } from "@/stores/wallet/use-user-wallet.store";
import { useTokenMessageStore } from "@/stores/token/use-token-messages.store";
import { useCurrentTokenChartPriceStore } from "@/stores/token/use-current-token-chart-price.store";

interface HoldersCardProps {
  rank: number;
  holder: ChartHolderInfo;
  tokenData: TokenInfo;
}

export default function HoldersCard({
  rank,
  holder,
  tokenData,
}: HoldersCardProps) {
  const width = useWindowSizeStore((state) => state.width);
  const { remainingScreenWidth } = usePopupStore();
  const isXlDown = width ? width < 1280 : false;
  const holdersBought = useTokenCardsFilter((state) => state.holdersBought);
  const holdersSold = useTokenCardsFilter((state) => state.holdersSold);
  const holdersRemaining = useTokenCardsFilter(
    (state) => state.holdersRemaining,
  );
  // const price = useTokenMessageStore((state) => state.priceMessage);

  const userWalletFullList = useUserWalletStore(
    (state) => state.userWalletFullList,
  );

  const isTradeMatchWithExistingUserWallet = useMemo(
    () => userWalletFullList.find((w) => w.address === holder?.maker),
    [userWalletFullList, holder?.maker],
  );

  const price = useTokenMessageStore((state) => state.priceMessage);

  const initialTokenPriceSol = useTokenMessageStore(
    (state) => state.priceMessage.price_sol,
  );
  const currentGlobalChartPrice = useCurrentTokenChartPriceStore(
    (state) => state.price,
  );
  const finalPrice =
    currentGlobalChartPrice === "" ||
    isNaN(Number(initialTokenPriceSol)) ||
    !currentGlobalChartPrice
      ? initialTokenPriceSol
      : currentGlobalChartPrice;

  // console.log("HOLDERS DEBUG | USER STATUS ✨", {
  //   userWalletFullList,
  //   isMatch:
  //     isTradeMatchWithExistingUserWallet?.address === holder?.maker
  //       ? "🟢"
  //       : "🔴",
  //   isTradeMatchWithExistingUserWallet,
  // });

  const getRemainingValue = useCallback(
    (type: "amount" | "percentage" | "total" | "amount_in_sol") => {
      const { sold_tokens, bought_tokens, token_balance } = holder;
      const totalTokens =
        sold_tokens > bought_tokens
          ? sold_tokens + token_balance
          : bought_tokens + token_balance;

      if (type === "percentage" && totalTokens === 0) {
        console.warn("Total tokens is zero. Cannot calculate percentage.");
        return 0;
      }
      if (type === "total") {
        return totalTokens;
      } else if (type === "amount") {
        return token_balance;
      } else if (type === "amount_in_sol") {
        return token_balance * Number(finalPrice);
      } else if (type === "percentage") {
        return (token_balance / totalTokens) * 100;
      } else {
        return 0;
      }
    },
    [holder],
  );

  // Memoize expensive computations
  const trackedWallets = useWalletTrackerMessageStore(
    (state) => state.trackedWallets,
  );
  const isTradeMatchWithExistingTrackedWallet = useMemo(
    () => trackedWallets.find((w) => w.address === holder?.maker),
    [trackedWallets, holder?.maker],
  );

  return (
    <div
      className={cn(
        "flex-shrink-0 items-center overflow-hidden from-background to-background-1",
        "max-xl:rounded-[8px] max-xl:border max-xl:border-border max-xl:bg-card",
        "transition-colors duration-200 ease-out xl:flex xl:h-[72px] xl:min-w-max",
        rank % 2 === 0 ? "" : "xl:bg-shadeTable xl:hover:bg-shadeTableHover",
        // remainingScreenWidth < 1280 && "max-xl:rounded-none max-xl:border-none max-xl:bg-transparent xl:flex xl:h-auto xl:min-w-fit",
        remainingScreenWidth < 1280 &&
          "!m-4 !rounded-[8px] !border !border-border !bg-card xl:flex xl:h-auto xl:min-w-fit",
      )}
    >
      {isXlDown || remainingScreenWidth < 1280 ? (
        <MobileView
          rank={rank}
          holder={holder}
          holdersBought={holdersBought}
          holdersSold={holdersSold}
          getRemainingValue={getRemainingValue}
          isTradeMatchWithExistingTrackedWallet={
            isTradeMatchWithExistingTrackedWallet
          }
          isTradeMatchWithExistingUserWallet={
            isTradeMatchWithExistingUserWallet
          }
          remainingScreenWidth={remainingScreenWidth}
          tokenData={tokenData}
        />
      ) : (
        <DesktopView
          rank={rank}
          holder={holder}
          tokenData={tokenData}
          holdersBought={holdersBought}
          holdersSold={holdersSold}
          holdersRemaining={holdersRemaining}
          getRemainingValue={getRemainingValue}
          isTradeMatchWithExistingTrackedWallet={
            isTradeMatchWithExistingTrackedWallet
          }
          isTradeMatchWithExistingUserWallet={
            isTradeMatchWithExistingUserWallet
          }
        />
      )}
    </div>
  );
}
