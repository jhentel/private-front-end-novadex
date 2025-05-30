"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import React, {
  useRef,
  useMemo,
  useCallback,
  useState,
  useEffect,
} from "react";
import { useUserWalletStore } from "@/stores/wallet/use-user-wallet.store";
import { useHoldingsHideStore } from "@/stores/holdings/use-holdings-hide.store";
import { useHoldingsMessageStore } from "@/stores/holdings/use-holdings-messages.store";
import { useHoldingsMarqueeSortStore } from "@/stores/holdings/use-holdings-marquee-sort.store";
import { useWatchlistTokenStore } from "@/stores/use-watchlist-token.store";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useWindowSize } from "@/hooks/use-window-size";
import toast from "react-hot-toast";
// ######## APIs 🛜 ########
import {
  fetchWatchlist,
  removeFromWatchlist,
  WatchlistToken,
} from "@/apis/rest/watchlist";
// ######## Components 🧩 #########
import Link from "next/link";
import Image from "next/image";
import CustomToast from "@/components/customs/toasts/CustomToast";
// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";
import { truncateString } from "@/utils/truncateString";
import {
  formatAmountWithoutLeadingZero,
  formatAmountDollar,
} from "@/utils/formatAmount";
import { getProxyUrl } from "@/utils/getProxyUrl";
import {
  HOLDINGS_BATCH_PROCESSING_INTERVAL_MS,
  HOLDINGS_CHART_PRICE_BATCH_PROCESSING_INTERVAL_MS,
} from "@/constants/duration";
import {
  HoldingsChartPriceDataQueuedMessage,
  HoldingsDataQueuedMessage,
} from "@/components/customs/sections/HoldingsListSection";
import cookies from "js-cookie";
import { useWebSocket } from "@/hooks/useWebsocketNew";
import {
  HoldingsConvertedMessageType,
  HoldingsTokenData,
} from "@/types/ws-general";
import { usePathname } from "next/navigation";

type HoldingItemProps = {
  isLast: boolean;
  image: string;
  tokenSymbol: string;
  remainingSol: number;
  percentage: number;
  mint: string;
  walletName: string;
};
const HoldingItem = React.memo(
  ({
    isLast,
    image,
    tokenSymbol,
    remainingSol,
    percentage,
    mint,
    walletName,
  }: HoldingItemProps) => {
    return (
      <Link
        href={`/token/${mint}`}
        prefetch
        className={cn(
          "flex flex-shrink-0 items-center justify-center gap-x-1 border-r border-border pl-1.5 pr-2 hover:cursor-pointer",
          isLast && "border-r-0",
        )}
      >
        <span className="font-geistMonoBold text-xs text-fontColorPrimary">
          {`(${truncateString(walletName, 5)})`}
        </span>
        <div className="relative aspect-square h-4 w-4 flex-shrink-0 overflow-hidden rounded-full">
          <Image
            src={image}
            alt="Token Image"
            fill
            quality={100}
            className="object-contain"
          />
        </div>
        <span className="font-geistMonoLight text-xs text-fontColorPrimary">
          {truncateString(tokenSymbol, 5)}
        </span>
        <span className="font-geistMonoLight text-xs text-fontColorSecondary">
          {formatAmountWithoutLeadingZero(Number(remainingSol ?? 0))}
        </span>
        <span
          className={cn(
            "font-geistMonoLight text-xs",
            percentage > 0 ? "text-success" : "text-destructive",
          )}
        >
          {percentage > 0 ? "+" : ""}
          {!percentage ? 0 : percentage?.toFixed(2)}%
        </span>
      </Link>
    );
  },
);
HoldingItem.displayName = "HoldingItem";

const WatchlistItem = React.memo(
  ({ image, symbol, marketCap, pnl, mint }: WatchlistToken) => {
    const queryClient = useQueryClient();
    const removeFromWatchlistMutation = useMutation({
      mutationFn: removeFromWatchlist,
      onSuccess: (data) => {
        /* console.log("WATCHLIST REMOVE SUCCESS ⭕", data) */;

        toast.custom((t: any) => (
          <CustomToast
            tVisibleState={t.visible}
            message="Removed from Watchlist"
            state="SUCCESS"
          />
        ));
        queryClient.invalidateQueries({ queryKey: ["watchlist"] });
      },
      onError: (error: Error) => {
        toast.custom((t: any) => (
          <CustomToast
            tVisibleState={t.visible}
            message={error.message}
            state="ERROR"
          />
        ));
      },
    });

    const handleRemove = (mint: string) => {
      removeFromWatchlistMutation.mutate(mint);
    };

    const imageSrc = useMemo(
      () => getProxyUrl(image as string, symbol?.[0] || ""),
      [image, symbol],
    );

    return (
      <div className="group relative flex w-auto flex-shrink-0 items-center justify-center gap-x-1 rounded-[4px] bg-[#17171F] py-[2.5px] pl-0.5 pr-1 transition-all duration-200 ease-in-out">
        <div className="absolute left-0 top-px z-10 h-px w-1/2 bg-gradient-to-r from-[#FFFFFF00] via-[#FFFFFF]/50 to-[#FFFFFF00] opacity-0 duration-200 ease-in-out group-hover:opacity-100"></div>
        <div className="absolute bottom-px right-0 z-10 h-px w-1/2 bg-gradient-to-r from-[#FFFFFF00] via-[#FFFFFF]/50 to-[#FFFFFF00] opacity-0 duration-200 ease-in-out group-hover:opacity-100"></div>

        <Link
          href={`/token/${mint}`}
          prefetch
          className="relative z-20 flex gap-x-1"
        >
          <div className="relative aspect-square h-4 w-4 flex-shrink-0 overflow-hidden rounded-full">
            <Image
              key={imageSrc}
              src={imageSrc as string}
              alt="Token Watchlist Image"
              fill
              quality={50}
              crossOrigin="anonymous"
              referrerPolicy="no-referrer"
              className="object-contain"
            />
          </div>
          <span className="font-geistMonoLight text-xs text-fontColorPrimary">
            ${truncateString(symbol, 5)}
          </span>
        </Link>
        <span className="font-geistMonoLight text-xs text-fontColorSecondary">
          {formatAmountDollar(Number(marketCap))}
        </span>
        <span
          className={cn(
            "font-geistMonoLight text-xs",
            pnl > 0 ? "text-success" : "text-destructive",
          )}
        >
          {pnl > 0 ? "+" : "-"}
          {!pnl ? 0 : pnl?.toFixed(2)}%
        </span>

        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          className="w-0 scale-0 cursor-pointer opacity-0 transition-all duration-200 ease-in-out group-hover:w-4 group-hover:scale-100 group-hover:opacity-100"
          onClick={() => handleRemove(mint)}
        >
          <path
            d="M8.86266 2.00066C9.61657 2.00077 10.2279 2.61196 10.2279 3.36589V3.94109H12.8861C13.0448 3.94109 13.1742 4.06946 13.1742 4.2282V4.80339C13.174 4.96198 13.0447 5.0905 12.8861 5.0905H12.2924L11.809 11.7809C11.7886 12.0635 11.7713 12.3089 11.7406 12.5104C11.7081 12.7239 11.6548 12.9347 11.5394 13.1354C11.3664 13.4365 11.106 13.6779 10.7933 13.8288C10.5848 13.9294 10.3709 13.968 10.1556 13.985C9.95243 14.0011 9.70652 14.0007 9.42321 14.0007H6.57653C6.2931 14.0007 6.04736 14.0011 5.84411 13.985C5.62882 13.968 5.41493 13.9294 5.20641 13.8288C4.89384 13.6779 4.63429 13.4363 4.4613 13.1354C4.34589 12.9347 4.29264 12.724 4.26012 12.5104C4.22944 12.3089 4.21119 12.0636 4.19079 11.7809L3.70837 5.0905H3.11364C2.95516 5.09033 2.82671 4.96187 2.82653 4.80339V4.2282C2.82653 4.06957 2.95505 3.94126 3.11364 3.94109H5.77282V3.36589C5.77284 2.61189 6.38405 2.00066 7.13805 2.00066H8.86266ZM6.77868 6.81511C6.61994 6.81511 6.49157 6.94348 6.49157 7.10222V10.5514C6.49166 10.7101 6.62 10.8386 6.77868 10.8386H7.20934C7.36803 10.8386 7.49734 10.7101 7.49743 10.5514V7.10222C7.49743 6.94348 7.36808 6.81511 7.20934 6.81511H6.77868ZM8.7904 6.81511C8.63175 6.81522 8.50329 6.94355 8.50329 7.10222V10.5514C8.50338 10.71 8.63181 10.8384 8.7904 10.8386H9.22204C9.38058 10.8384 9.50906 10.71 9.50915 10.5514V7.10222C9.50915 6.94358 9.38064 6.81528 9.22204 6.81511H8.7904ZM7.13805 3.00652C6.93964 3.00652 6.7787 3.16748 6.77868 3.36589V3.94109H9.22204V3.36589C9.22202 3.16755 9.06098 3.00663 8.86266 3.00652H7.13805Z"
            fill="#FCFCFD"
          />
        </svg>
      </div>
    );
  },
);
WatchlistItem.displayName = "WatchlistItem";

const HOLDINGS_SORT_BUTTON_WIDTH = 130;
const WATCLIST_ICON = 130;
const GAPS = 50;
const HOLDING_ITEM_WIDTH = 235;
const WATCHLIST_ITEM_WIDTH = 180;

export default function HoldingsAndWatchlist() {
  const pathname = usePathname();
  const holdingsDataMessageQueueRef = useRef<HoldingsDataQueuedMessage[]>([]);
  const holdingsDataProcessingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const chartPriceHoldingsDataMessageQueueRef = useRef<
    HoldingsChartPriceDataQueuedMessage[]
  >([]);
  const chartPriceHoldingsDataProcessingTimerRef =
    useRef<NodeJS.Timeout | null>(null);
  const { width } = useWindowSize();

  // ######## Holdings 🪙 ########
  const holdingsMessages = useHoldingsMessageStore((state) => state.messages);
  const sortType = useHoldingsMarqueeSortStore((state) => state.sortType);
  const setSortType = useHoldingsMarqueeSortStore((state) => state.setSortType);
  const updateHoldingsMessages = useHoldingsMessageStore(
    (state) => state.updateMessage,
  );
  const chartPriceMessage = useHoldingsMessageStore(
    (state) => state.chartPriceMessage,
  );
  const setChartPriceMessage = useHoldingsMessageStore(
    (state) => state.setChartPriceMessage,
  );
  const setMarqueeMint = useHoldingsMessageStore(
    (state) => state.setMarqueeMint,
  );
  const marqueeMints = useHoldingsMessageStore((state) => state.marqueeMint);

  const hiddenTokenList = useHoldingsHideStore(
    (state) => state.hiddenTokenList,
  );

  // const holdingsItemLimit = useMemo(() => {
  //   const remainingWidth =
  //     (width! - HOLDINGS_SORT_BUTTON_WIDTH - GAPS - WATCLIST_ICON) / 2;

  //   return Math.round(remainingWidth / HOLDING_ITEM_WIDTH);
  // }, [width]);
  // const watchlistItemLimit = useMemo(() => {
  //   const remainingWidth =
  //     (width! - HOLDINGS_SORT_BUTTON_WIDTH - GAPS - WATCLIST_ICON) / 2;

  //   return Math.round(remainingWidth / WATCHLIST_ITEM_WIDTH + 0.5);
  // }, [width]);

  const finalHoldings = useMemo(() => {
    if (!holdingsMessages.length) return [];

    return holdingsMessages
      .map((cm) => ({
        ...cm,
        tokens: cm.tokens
          ?.map((t) => {
            return {
              ...t,
              walletName: cm.wallet,
            } as HoldingsTokenData;
          })
          // .filter((token) => token.balance !== 0),
          .filter((token) => token.investedSol > 0)
      }))
      ?.filter((cm) => cm.tokens.length > 0);
  }, [holdingsMessages]);

  const filteredAndSortedTokens = useMemo(() => {
    const allTokens =
      finalHoldings
        ?.flatMap((wallet) => wallet.tokens || []) // collect tokens from all wallets
        .filter((t: any) => !hiddenTokenList.includes(t.token.mint)) // filter hidden tokens
        .sort((a, b) =>
          sortType === "amount"
            ? b.balance - a.balance
            : b.lastBought - a.lastBought,
        ) || [];

    return allTokens;
  }, [finalHoldings, hiddenTokenList, sortType]);

  const userWalletsWithName = useUserWalletStore(
    (state) => state.userWalletFullList,
  );

  const renderHoldingItems = useCallback(() => {
    const source = filteredAndSortedTokens?.slice(0, 10);
    // const source = filteredAndSortedTokens?.slice(0, holdingsItemLimit);

    return source?.map((item, index) => {
      const priceSol = chartPriceMessage?.find(
        (price) => price.mint === item?.token?.mint,
      )?.priceSol || item?.price?.price_sol;
      const remainingSol = item?.balance * priceSol;
      const prevCalc = item?.soldSol + item?.balance * priceSol;
      const pnlSol = prevCalc - item?.investedSol;
      const pnlPercentage = (pnlSol / item?.investedSol) * 100;
      // console.log("pnlPercentage", {
      //   pnlSol,
      //   investedSol: item?.investedSol,
      //   pnlPercentage,
      //   item
      // })
      const walletName = userWalletsWithName.find(
        (wallet) => wallet.address === item?.walletName,
      )?.name;
      const proxyImage = getProxyUrl(item?.token?.image, item?.token?.symbol);

      return (
        <HoldingItem
          isLast={source.length - 1 === index}
          key={item?.token?.mint + index}
          remainingSol={remainingSol || 0}
          image={proxyImage}
          mint={item?.token?.mint}
          percentage={pnlPercentage || 0}
          tokenSymbol={item?.token?.symbol}
          walletName={walletName || "UW"}
        />
      );
    });
  }, [
    filteredAndSortedTokens,
    // holdingsItemLimit,
    chartPriceMessage,
    userWalletsWithName,
  ]);

  const handleSendMessage = (mints: string[]) => {
    try {
      const chartHoldingsSubscriptionLeaveMessage = {
        channel: "chartHoldings",
        token: cookies.get("_nova_session"),
        action: "leave",
      };
      const chartHoldingsSubscriptionJoinMessage = {
        channel: "chartHoldings",
        mints,
        token: cookies.get("_nova_session"),
        action: "join",
        method: "holdings",
      };
      const batchPriceSubscriptionLeaveMessage = {
        channel: "batchPrice",
        token: cookies.get("_nova_session"),
        action: "leave",
      };
      const batchPriceSubscriptionJoinMessage = {
        channel: "batchPrice",
        mints,
        token: cookies.get("_nova_session"),
        action: "join",
      };

      holdingSendMessage(chartHoldingsSubscriptionLeaveMessage);
      holdingSendMessage(chartHoldingsSubscriptionJoinMessage);
      holdingSendMessage(batchPriceSubscriptionLeaveMessage);
      holdingSendMessage(batchPriceSubscriptionJoinMessage);
    } catch (error) {
      console.warn("Error sending message:", error);
    }
  };
  const processHoldingsDataMessageQueue = () => {
    const currentQueue: HoldingsDataQueuedMessage[] = [
      ...holdingsDataMessageQueueRef.current,
    ];
    holdingsDataMessageQueueRef.current = [];

    currentQueue.forEach(({ data }) => {
      updateHoldingsMessages(data);
    });
  };
  const processChartPriceHoldingsDataMessageQueue = () => {
    const currentQueue = [...chartPriceHoldingsDataMessageQueueRef.current];
    chartPriceHoldingsDataMessageQueueRef.current = [];

    setChartPriceMessage(currentQueue.map((item) => item.data));
  };
  const { sendMessage: holdingSendMessage } = useWebSocket({
    channel: "chartHoldings",
    onInit: () => {
      if (pathname === "/holdings") return;
      holdingsDataProcessingTimerRef.current = setInterval(
        processHoldingsDataMessageQueue,
        HOLDINGS_BATCH_PROCESSING_INTERVAL_MS,
      );
      chartPriceHoldingsDataProcessingTimerRef.current = setInterval(
        processChartPriceHoldingsDataMessageQueue,
        HOLDINGS_CHART_PRICE_BATCH_PROCESSING_INTERVAL_MS,
      );
    },
    onLeave: () => {
      if (pathname === "/holdings") return;
      if (holdingsDataProcessingTimerRef.current) {
        clearInterval(holdingsDataProcessingTimerRef.current);
        holdingsDataProcessingTimerRef.current = null;
      }
    },
    onMessage: (event) => {
      if (pathname === "/holdings") return;
      try {
        if (event?.channel === "ping" && event.success === true) {
          return;
        }

        const newMessage = event;
        if (newMessage.channel == "chartHoldings") {
          const prevHoldingWallet = holdingsDataMessageQueueRef.current.find(
            (item) =>
              (item.data as HoldingsConvertedMessageType).wallet ===
              newMessage?.data?.wallet,
          );
          const prevToken = (
            prevHoldingWallet?.data as HoldingsConvertedMessageType
          )?.tokens?.find(
            (item) => item.token.mint === newMessage?.data?.holding.token.mint,
          );
          if (
            newMessage?.data.holding.investedSol == 0 ||
            (prevToken?.balance === newMessage?.data?.holding.balance &&
              prevToken?.soldSol !== newMessage?.data?.holding.soldSol &&
              !(
                prevToken?.balance !== newMessage?.data?.holding.balance &&
                prevToken?.soldSol !== newMessage?.data?.holding.soldSol
              ))
          )
            return;
          holdingsDataMessageQueueRef.current.push({
            data: {
              wallet: newMessage?.data?.wallet,
              tokens: [newMessage?.data?.holding],
            },
            timestamp: Date.now(),
          });
          return;
        } else if (newMessage.channel == "batchPrice") {
          /* console.log("chartPriceMessage👀👀🌟🌟", newMessage) */;
          chartPriceHoldingsDataMessageQueueRef.current.push({
            data: newMessage,
            timestamp: Date.now(),
          });
        }
      } catch (e) {
        console.warn("Error parsing message:", e);
        // addError("holding", {
        //   message: (e as any).message || "Error parsing message",
        //   timestamp: new Date(),
        // });
      }
    },
  });
  const stringKeyMarqueeMints = useMemo(() => {
    if (
      (filteredAndSortedTokens?.slice(0, 10)?.length || 0) > 0
      // (filteredAndSortedTokens?.slice(0, holdingsItemLimit)?.length || 0) > 0
    ) {
      return (
        filteredAndSortedTokens
          ?.slice(0, 10)
          // ?.slice(0, holdingsItemLimit)
          .map((h) => h.token.mint)
          .join(",") || ""
      );
    }
    return "";
  }, [
    filteredAndSortedTokens
      ?.slice(0, 10)
      // ?.slice(0, holdingsItemLimit)
      .map((h) => h.token.mint),
  ]);

  useEffect(() => {
    setMarqueeMint(
      filteredAndSortedTokens
        ?.slice(0, 10)
        // ?.slice(0, holdingsItemLimit)
        .map((h) => h.token.mint) || [],
    );
    if (pathname === "/holdings" || stringKeyMarqueeMints.length === 0) return;
    handleSendMessage(
      filteredAndSortedTokens
        ?.slice(0, 10)
        // ?.slice(0, holdingsItemLimit)
        .map((h) => h.token.mint) || [],
    );
  }, [
    stringKeyMarqueeMints,
    // holdingsItemLimit
  ]);

  // ######## Watchlist ⭐ ########
  const watchlistToken = useWatchlistTokenStore(
    (state) => state.watchlistToken,
  );
  const setWatchlistToken = useWatchlistTokenStore(
    (state) => state.setWatchlistToken,
  );
  const setOldestTokenMint = useWatchlistTokenStore(
    (state) => state.setOldestTokenMint,
  );

  const { data, isLoading } = useQuery({
    queryKey: ["watchlist"],
    queryFn: fetchWatchlist,
    //   const res = await fetchWatchlist();
    //   setOldestTokenMint(res[0].mint);

    //   const crossed = res.find((token) => Math.abs(token.pnl) >= 50);

    //   if (crossed) {
    //     toast.custom((t: any) => (
    //       <CustomToast
    //         tVisibleState={t.visible}
    //         message={`${crossed.symbol} has ${crossed.pnl > 0 ? "surged" : "dropped"} ${crossed.pnl}%`}
    //         state="ERROR"
    //       />
    //     ));
    //   }

    //   let sorted = [...res].sort((a, b) => b.pnl - a.pnl);

    //   if (crossed) {
    //     sorted = [
    //       crossed,
    //       ...sorted.filter((token) => token.mint !== crossed.mint),
    //     ];
    //   }

    //   console.log("WATCHLIST SETLIST SUCCESS ⭐", res);

    //   setWatchlistToken(sorted);
    //   return sorted;
    // },
  });

  // useEffect(() => {
  //   console.log("WATCHLIST SETLIST DETECTION ✒️", {
  //     data,
  //     isLoading,
  //   });

  //   if (data && !isLoading) {
  //     setWatchlistToken(data);
  //   }
  // }, [isLoading, data]);

  const renderWatchlistItems = useCallback(() => {
    return (
      watchlistToken
        ?.slice(0, 10)
        // ?.slice(0, watchlistItemLimit)
        ?.map((item) => <WatchlistItem key={item?.mint} {...item} />)
    );
  }, [
    watchlistToken,
    //watchlistItemLimit
  ]);

  return (
    <div className="relative hidden h-10 w-full items-center justify-start gap-x-4 overflow-hidden border-b border-border pl-4 sm:flex">
      {/* <div className="fixed left-1/2 top-10 z-[10000] flex -translate-x-1/2 flex-col rounded-md border border-white/50 bg-black p-1.5 font-geistMonoRegular text-xs text-white">
        <h4 className="mb-1 font-geistMonoSemiBold text-sm">
          HOLDING & WATHCLIST DEBUG ⭐
        </h4>
        <span>
          Screen Width:{" "}
          {width! - HOLDINGS_SORT_BUTTON_WIDTH - GAPS - WATCLIST_ICON}
        </span>
        <span>
          Holdings Width:{" "}
          {(width! - HOLDINGS_SORT_BUTTON_WIDTH - GAPS - WATCLIST_ICON) / 2}
        </span>
        <span>
          Wathclist Width:{" "}
          {(width! - HOLDINGS_SORT_BUTTON_WIDTH - GAPS - WATCLIST_ICON) / 2}
        </span>
        <div className="my-2 h-px w-full bg-white/40"></div>
        <span>
          Raw Holdings Limit:{" "}
          {(width! - HOLDINGS_SORT_BUTTON_WIDTH - GAPS - WATCLIST_ICON) /
            2 /
            HOLDING_ITEM_WIDTH}
        </span>
        <span>
          Raw Wathclist Limit:{" "}
          {(width! - HOLDINGS_SORT_BUTTON_WIDTH - GAPS - WATCLIST_ICON) /
            2 /
            WATCHLIST_ITEM_WIDTH}
        </span>
        <span>Final Holdings Limit: {holdingsItemLimit}</span>
        <span>Final Wathclist Limit: {watchlistItemLimit}</span>
      </div> */}

      <div className="flex w-1/2 items-center">
        <div className="relative mr-2 h-[24px] w-[9rem] flex-shrink-0 rounded-[8px] border border-border p-[1.5px]">
          <div className={cn("flex h-full w-full rounded-[6px] bg-white/[8%]")}>
            <button
              type="button"
              onClick={() => setSortType("amount")}
              className={cn(
                "w-full cursor-pointer rounded-[6px] font-geistMonoSemiBold text-[10px] leading-3 text-fontColorPrimary duration-300 hover:text-[#cccce1] lg:text-xs",
                sortType === "amount"
                  ? "bg-white/[8%] text-fontColorPrimary"
                  : "",
              )}
            >
              Amount
            </button>
            <button
              type="button"
              onClick={() => setSortType("recent")}
              className={cn(
                "w-full cursor-pointer rounded-[6px] font-geistMonoSemiBold text-[10px] leading-3 text-fontColorPrimary duration-300 hover:text-[#cccce1] lg:text-xs",
                sortType === "recent"
                  ? "bg-white/[8%] text-fontColorPrimary"
                  : "",
              )}
            >
              Recent
            </button>
          </div>
        </div>
        <div className="nova-scroller hide relative flex h-[24px] flex-grow items-center justify-start">
          {isLoading ? (
            <div className="absolute left-0 top-0 flex h-full w-full items-center gap-x-1">
              {Array.from({
                length: 5,
              })
                .slice(0, 10)
                // .slice(0, holdingsItemLimit)
                .map((_, index) => (
                  <div
                    key={index}
                    className="group relative flex h-5 w-[200px] flex-shrink-0 animate-pulse items-center justify-center gap-x-1 rounded-[4px] bg-[#17171F] px-2 py-[2.5px]"
                  />
                ))}
            </div>
          ) : (
            <>
              {filteredAndSortedTokens &&
              filteredAndSortedTokens?.length > 0 ? (
                <div className="absolute left-0 top-0 flex h-full w-full items-center gap-x-1">
                  {renderHoldingItems()}
                </div>
              ) : (
                <div className="absolute left-0 top-0 flex h-full w-full items-center justify-start gap-x-1">
                  <span className="font-geistMonoSemiBold text-[10px] leading-3 text-[#9191A4]">
                    Start making some trades to see your holdings...
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-x-0.5">
        <div className="h-5 w-[1px] bg-border"></div>
        <div className="h-7 w-[1px] bg-border"></div>
        <div className="h-5 w-[1px] bg-border"></div>
      </div>

      <div className="flex w-1/2 items-center gap-x-3">
        <div className="flex items-center">
          {/* <span className="font-geistMonoSemiBold text-[10px] text-fontColorPrimary lg:text-xs">
            Watchlist
          </span> */}
          <svg
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="aspect-square size-[18px]"
          >
            <path
              d="M8.39381 2L8.42649 2.00339C8.85088 2.04741 9.22622 2.30174 9.42266 2.68326L9.42693 2.69156L10.6793 5.2146L13.4758 5.62029C13.9485 5.68812 14.3436 6.01448 14.4999 6.46415L14.5038 6.47536C14.6543 6.93616 14.5243 7.4414 14.1719 7.77294L14.1708 7.774L12.0721 9.76044L12.5712 12.5227C12.6573 13.0012 12.4569 13.4852 12.0599 13.7633C11.67 14.0444 11.1559 14.0764 10.7348 13.8525L8.23285 12.5475L8.19586 12.5475L5.72621 13.8414C5.48428 13.963 5.20932 14.0063 4.93945 13.963L4.93072 13.9616L4.92202 13.96C4.24895 13.8326 3.8004 13.1917 3.91058 12.5159L3.91235 12.505L4.4129 9.73845L2.37882 7.7669C2.03225 7.43065 1.91014 6.92424 2.06816 6.46657C2.21994 6.02103 2.60578 5.69505 3.07228 5.62163L3.07984 5.62044L5.89924 5.21147L5.90785 5.21059L7.14364 2.67694L7.1474 2.66969C7.20598 2.55704 7.28405 2.4483 7.38331 2.35272L7.40747 2.32945L7.45162 2.29511C7.51184 2.23707 7.57727 2.18851 7.6456 2.14865L7.69411 2.12035L7.79678 2.08267L7.99756 2H8.39381Z"
              fill="#FCBE78"
            />
          </svg>
        </div>
        <div className="nova-scroller hide relative flex h-[24px] flex-grow items-center justify-start">
          {isLoading ? (
            <div className="absolute left-0 top-0 flex h-full w-full items-center gap-x-1">
              {Array.from({ length: 5 })
                .slice(0, 10)
                //.slice(0, watchlistItemLimit)
                .map((_, index) => (
                  <div
                    key={index}
                    className="group relative flex h-5 w-[180px] flex-shrink-0 animate-pulse items-center justify-center gap-x-1 rounded-[4px] bg-[#17171F] px-2 py-[2.5px]"
                  />
                ))}
            </div>
          ) : (
            <>
              {watchlistToken && watchlistToken?.length > 0 ? (
                <div className="absolute left-0 top-0 flex h-full w-full items-center gap-x-1">
                  {renderWatchlistItems()}
                </div>
              ) : (
                <div className="absolute left-0 top-0 flex h-full w-full items-center justify-start gap-x-1">
                  <span className="font-geistMonoSemiBold text-[10px] leading-3 text-[#9191A4]">
                    No watch list at the moment...
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <span className="absolute right-0 top-0 z-50 block h-full w-[10%] bg-gradient-to-r from-black/0 to-black"></span>
    </div>
  );
}
